import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { OrderReturn, OrderReturnDocument } from './schemas/order-return.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { StockLedger, StockLedgerDocument } from './schemas/stock-ledger.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from '../customers/schemas/customer-ledger.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { CreateReturnDto } from './dto/create-return.dto';
import { SequenceService } from '../sequence/sequence.service';
import { AuthenticatedUser, NumberUtil, runInTransaction, toDocumentView } from '../../common';

const round2 = (value: number) => NumberUtil.round(value, 2);

export interface ReturnableItem {
  productId: string;
  name: string;
  barcode: string;
  soldQty: number;
  returnedQty: number;
  returnableQty: number;
  unitPrice: number;
  taxRatePercent: number;
  /** Refund per unit including the GST that was charged. */
  unitRefund: number;
}

@Injectable()
export class OrderReturnsService {
  private readonly logger = new Logger(OrderReturnsService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(OrderReturn.name) private readonly returnModel: Model<OrderReturnDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly customerLedgerModel: Model<CustomerLedgerDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  /** Invoice, its previous returns, and what can still be returned per line. */
  async getInvoiceReturnInfo(tenantIdStr: string, invoiceNumber: string) {
    const tenantId = new Types.ObjectId(tenantIdStr);
    const order = await this.orderModel.findOne({ tenantId, invoiceNumber: invoiceNumber.trim() }).lean();
    if (!order) {
      throw new NotFoundException(`Invoice ${invoiceNumber} not found.`);
    }
    const returns = await this.returnModel
      .find({ tenantId, originalInvoiceNumber: order.invoiceNumber })
      .sort({ createdAt: -1 })
      .lean();

    return {
      order: toDocumentView(order),
      returns: returns.map(toDocumentView),
      returnableItems: this.computeReturnable(order, returns),
    };
  }

  async createReturn(tenantIdStr: string, dto: CreateReturnDto, user: AuthenticatedUser) {
    const tenantId = new Types.ObjectId(tenantIdStr);
    const { order, returnableItems } = await this.getInvoiceReturnInfo(tenantIdStr, dto.originalInvoiceNumber);
    const returnableById = new Map(returnableItems.map((r) => [r.productId, r]));

    const requested = new Map<string, { qty: number; reason: CreateReturnDto['items'][number]['reason'] }>();
    for (const item of dto.items) {
      const prev = requested.get(item.productId);
      requested.set(item.productId, { qty: (prev?.qty ?? 0) + item.quantityReturned, reason: item.reason });
    }

    const lines = [...requested.entries()].map(([productId, { qty, reason }]) => {
      const info = returnableById.get(productId);
      if (!info) {
        throw new BadRequestException(`Product ${productId} is not on invoice ${order.invoiceNumber}.`);
      }
      if (qty > info.returnableQty) {
        throw new BadRequestException(
          `Only ${info.returnableQty} of ${info.name} can still be returned (sold ${info.soldQty}, already returned ${info.returnedQty}).`,
        );
      }
      return {
        productId: new Types.ObjectId(productId),
        name: info.name,
        barcode: info.barcode,
        quantityReturned: qty,
        unitPrice: info.unitPrice,
        taxRatePercent: info.taxRatePercent,
        refundAmount: round2(info.unitRefund * qty),
        reason,
      };
    });
    const totalRefundAmount = round2(lines.reduce((sum, l) => sum + l.refundAmount, 0));

    if (dto.refundMode === 'CUSTOMER_KHATA' && !order.customerId) {
      throw new BadRequestException('Khata refund needs an invoice billed to a registered customer.');
    }

    const tenant = await this.tenantModel.findById(tenantId).select('settings').lean();
    const cashierName = user.fullName || user.username || 'Cashier';

    const orderReturn = await runInTransaction(this.connection, async (session) => {
      const returnNumber = await this.sequenceService.next({
        tenantId,
        prefix: 'RET',
        timezone: tenant?.settings?.timezone,
        session,
        findExistingMax: (prefix) => this.findMaxReturnSeq(tenantId, prefix, session),
      });

      for (const line of lines) {
        await this.restock(tenantId, order.outletId as Types.ObjectId, line, returnNumber, order.invoiceNumber, session);
      }

      if (dto.refundMode === 'CUSTOMER_KHATA') {
        await this.creditKhata(tenantId, order.customerId as Types.ObjectId, totalRefundAmount, returnNumber, session);
      }

      const [created] = await this.returnModel.create(
        [
          {
            tenantId,
            outletId: order.outletId,
            orderId: order._id,
            originalInvoiceNumber: order.invoiceNumber,
            returnNumber,
            items: lines,
            totalRefundAmount,
            refundMode: dto.refundMode,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            cashierName,
            remarks: dto.remarks,
          },
        ],
        { session },
      );
      return created;
    });

    this.logger.log(`Sales return ${orderReturn.returnNumber} processed for ₹${totalRefundAmount} [${order.invoiceNumber}]`);
    return toDocumentView(orderReturn.toObject());
  }

  async getReturns(tenantId: string, limit = 50) {
    const returns = await this.returnModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 500))
      .lean();
    return returns.map(toDocumentView);
  }

  private computeReturnable(
    order: { items: Order['items'] },
    returns: Array<{ items: OrderReturn['items'] }>,
  ): ReturnableItem[] {
    const returned = new Map<string, number>();
    for (const r of returns) {
      for (const item of r.items) {
        const key = item.productId.toString();
        returned.set(key, (returned.get(key) ?? 0) + item.quantityReturned);
      }
    }

    return order.items.map((item) => {
      const returnedQty = returned.get(item.productId) ?? 0;
      return {
        productId: item.productId,
        name: item.name,
        barcode: item.barcode,
        soldQty: item.quantity,
        returnedQty,
        returnableQty: Math.max(0, item.quantity - returnedQty),
        unitPrice: item.unitPrice,
        taxRatePercent: item.taxRatePercent || 0,
        // Proportional share of what the customer actually paid for the line (incl. GST).
        unitRefund: round2(item.total / item.quantity),
      };
    });
  }

  private async restock(
    tenantId: Types.ObjectId,
    outletId: Types.ObjectId,
    line: { productId: Types.ObjectId; name: string; quantityReturned: number; reason: string },
    returnNumber: string,
    invoiceNumber: string,
    session?: ClientSession,
  ) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: line.productId, tenantId },
      { $inc: { stock: line.quantityReturned } },
      { new: true, session },
    );
    if (!product) return; // product deleted since the sale: nothing to restock

    await this.stockLedgerModel.create(
      [
        {
          tenantId,
          outletId,
          productId: line.productId,
          movementType: 'INWARD_RETURN',
          quantityDebit: 0,
          quantityCredit: line.quantityReturned,
          balanceAfter: product.stock,
          referenceType: 'ORDER',
          referenceId: returnNumber,
          remarks: `Sales Return [${line.reason}]: ${line.name} (${line.quantityReturned} qty) from ${invoiceNumber}`,
        },
      ],
      { session },
    );
  }

  private async creditKhata(
    tenantId: Types.ObjectId,
    customerId: Types.ObjectId,
    amount: number,
    returnNumber: string,
    session?: ClientSession,
  ) {
    const customer = await this.customerModel.findOneAndUpdate(
      { _id: customerId, tenantId },
      { $inc: { currentCreditBalance: -amount } },
      { new: true, session },
    );
    if (!customer) {
      throw new BadRequestException('Customer on this invoice no longer exists.');
    }

    await this.customerLedgerModel.create(
      [
        {
          tenantId,
          customerId,
          transactionType: 'ADJUSTMENT',
          amount,
          balanceAfter: round2(customer.currentCreditBalance),
          referenceType: 'PAYMENT',
          referenceId: returnNumber,
          remarks: `Refund Khata adjustment for return ${returnNumber}`,
        },
      ],
      { session },
    );
  }

  private async findMaxReturnSeq(tenantId: Types.ObjectId, prefix: string, session?: ClientSession) {
    const last = await this.returnModel
      .findOne({ tenantId, returnNumber: { $regex: `^${prefix}` } })
      .sort({ returnNumber: -1 })
      .select('returnNumber')
      .session(session ?? null)
      .lean();
    return SequenceService.parseSequence(last?.returnNumber);
  }
}
