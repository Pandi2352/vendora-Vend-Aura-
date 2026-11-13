import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { StockLedger, StockLedgerDocument } from './schemas/stock-ledger.schema';
import { CashDrawerShift, CashDrawerShiftDocument } from './schemas/cash-drawer-shift.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from '../customers/schemas/customer-ledger.schema';
import { CreateOrderDto, UpdateDeliveryDto } from './dto/create-order.dto';
import { SequenceService } from '../sequence/sequence.service';
import {
  AuthenticatedUser,
  NumberUtil,
  ObjectIdUtil,
  PaginationDto,
  PaginationUtil,
  runInTransaction,
  toDocumentView,
} from '../../common';

const round2 = (value: number) => NumberUtil.round(value, 2);

interface PricedLine {
  productId: Types.ObjectId;
  name: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
  taxAmount: number;
  total: number;
  batchNumber?: string;
  expiryDate?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(CashDrawerShift.name) private readonly shiftModel: Model<CashDrawerShiftDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly customerLedgerModel: Model<CustomerLedgerDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  /**
   * Finalizes a POS bill. Prices, tax and totals come from the catalog, never
   * from the client. Stock, ledgers, khata and the invoice are written in one
   * transaction (when the MongoDB deployment supports it).
   */
  async createOrder(tenantIdStr: string, dto: CreateOrderDto, user: AuthenticatedUser) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Shop not found.');
    }

    if (dto.offlineRef) {
      const existing = await this.orderModel.findOne({ tenantId, offlineRef: dto.offlineRef }).lean();
      if (existing) {
        return toDocumentView(existing);
      }
    }

    const openShift = await this.shiftModel.exists({ tenantId, status: 'OPEN' });
    if (!openShift && !dto.offlineRef) {
      throw new BadRequestException('No open cash drawer shift. Open the drawer before billing.');
    }

    const lines = await this.priceLines(tenantId, dto);
    const subTotal = round2(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
    const taxTotal = round2(lines.reduce((sum, l) => sum + l.taxAmount, 0));
    const cgst = round2(taxTotal / 2);
    const sgst = round2(taxTotal - cgst);
    const discountTotal = dto.discountAmount ? Math.min(dto.discountAmount, subTotal) : 0;
    const rawTotal = Math.max(0, subTotal - discountTotal + taxTotal);
    const grandTotal = Math.round(rawTotal);
    const roundOff = round2(grandTotal - rawTotal);

    let cashTendered = grandTotal;
    let changeDue = 0;
    if (dto.paymentMode === 'CASH' && dto.cashTendered !== undefined) {
      if (dto.cashTendered < grandTotal) {
        throw new BadRequestException(`Cash tendered ₹${dto.cashTendered} is less than the bill total ₹${grandTotal}.`);
      }
      cashTendered = round2(dto.cashTendered);
      changeDue = round2(cashTendered - grandTotal);
    }

    const customer = await this.resolveCustomer(tenantId, dto, grandTotal);
    const outletId = await this.resolveOutletId(tenant, user);
    const cashierName = user.fullName || user.username || 'Cashier';

    const order = await runInTransaction(this.connection, async (session) => {
      const invoiceNumber = await this.sequenceService.next({
        tenantId,
        prefix: 'INV',
        timezone: tenant.settings?.timezone,
        session,
        findExistingMax: (prefix) => this.findMaxInvoiceSeq(tenantId, prefix, session),
      });

      await this.deductStock(tenantId, outletId, lines, invoiceNumber, session);

      if (customer) {
        await this.applyCustomerSale(tenantId, customer._id, dto.paymentMode, grandTotal, invoiceNumber, session);
      }

      const [created] = await this.orderModel.create(
        [
          {
            tenantId,
            outletId,
            invoiceNumber,
            customerId: customer?._id ?? null,
            customerName: customer?.name ?? dto.customerName?.trim(),
            customerPhone: customer?.phone ?? dto.customerPhone?.trim(),
            items: lines.map((l) => ({ ...l, productId: l.productId.toString() })),
            couponCode: dto.couponCode?.trim().toUpperCase(),
            discountTotal,
            subTotal,
            taxTotal,
            cgst,
            sgst,
            roundOff,
            grandTotal,
            paymentMode: dto.paymentMode,
            cashTendered,
            changeDue,
            cashierName,
            status: 'COMPLETED',
            isHomeDelivery: !!dto.isHomeDelivery || !!dto.deliveryAddress,
            deliveryStatus: dto.isHomeDelivery || dto.deliveryAddress ? 'PENDING_DISPATCH' : undefined,
            deliveryAddress: dto.deliveryAddress?.trim(),
            deliveryRiderName: dto.deliveryRiderName?.trim(),
            deliveryRiderPhone: dto.deliveryRiderPhone?.trim(),
            isOfflineSync: !!dto.offlineRef,
            offlineRef: dto.offlineRef,
          },
        ],
        { session },
      );

      if (tenant.subscriptionId) {
        await this.subscriptionModel.updateOne(
          { _id: tenant.subscriptionId },
          { $inc: { billsGeneratedThisMonth: 1 } },
          { session },
        );
      }
      return created;
    });

    this.logger.log(`Order finalized: ${order.invoiceNumber} for Tenant: ${tenant.shopId} (₹${grandTotal})`);
    return toDocumentView(order.toObject());
  }

  async getOrders(tenantId: string, query: PaginationDto) {
    const result = await PaginationUtil.paginate(
      this.orderModel,
      { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') },
      { page: query.page, limit: query.limit, sort: { createdAt: -1 } },
    );
    return { ...result, data: result.data.map(toDocumentView) };
  }

  async getLedger(tenantId: string, query: PaginationDto) {
    return PaginationUtil.paginate(
      this.stockLedgerModel,
      { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') },
      {
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
        populate: { path: 'productId', select: 'name barcode category' },
      },
    );
  }

  async getOrderById(tenantId: string, orderId: string) {
    const order = await this.orderModel
      .findOne({ _id: ObjectIdUtil.toObjectId(orderId, 'order'), tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') })
      .lean();
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }
    return toDocumentView(order);
  }

  /** Merges duplicate lines and prices them from the catalog. */
  private async priceLines(tenantId: Types.ObjectId, dto: CreateOrderDto): Promise<PricedLine[]> {
    const quantities = new Map<string, number>();
    for (const item of dto.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const products = await this.productModel
      .find({ tenantId, _id: { $in: [...quantities.keys()].map((id) => ObjectIdUtil.toObjectId(id, 'product')) } })
      .lean();
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    return [...quantities.entries()].map(([productId, quantity]) => {
      const product = byId.get(productId);
      if (!product) {
        throw new BadRequestException(`Product ${productId} is not in this shop's catalog.`);
      }
      if (product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}: ${product.stock} ${product.unit} available, ${quantity} requested.`,
        );
      }
      const base = product.unitPrice * quantity;
      const taxAmount = round2((base * (product.taxRatePercent || 0)) / 100);
      return {
        productId: product._id as Types.ObjectId,
        name: product.name,
        barcode: product.barcode,
        quantity,
        unitPrice: product.unitPrice,
        taxRatePercent: product.taxRatePercent || 0,
        taxAmount,
        total: round2(base + taxAmount),
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate,
      };
    });
  }

  private async resolveCustomer(tenantId: Types.ObjectId, dto: CreateOrderDto, grandTotal: number) {
    if (!dto.customerId) {
      if (dto.paymentMode === 'CREDIT') {
        throw new BadRequestException('A registered customer is required to make a Credit / Khata sale.');
      }
      return null;
    }

    const customer = await this.customerModel.findOne({ _id: ObjectIdUtil.toObjectId(dto.customerId, 'customer'), tenantId }).lean();
    if (!customer) {
      throw new BadRequestException('Selected customer was not found in this shop.');
    }

    if (dto.paymentMode === 'CREDIT') {
      const projected = round2(customer.currentCreditBalance + grandTotal);
      if (projected > customer.creditLimit) {
        throw new BadRequestException(
          `Credit limit exceeded for ${customer.name}: outstanding ₹${customer.currentCreditBalance} + bill ₹${grandTotal} > limit ₹${customer.creditLimit}.`,
        );
      }
    }
    return customer;
  }

  private async deductStock(
    tenantId: Types.ObjectId,
    outletId: Types.ObjectId,
    lines: PricedLine[],
    invoiceNumber: string,
    session?: ClientSession,
  ) {
    for (const line of lines) {
      // Conditional decrement: never lets stock go below zero, even under concurrency.
      const updated = await this.productModel.findOneAndUpdate(
        { _id: line.productId, tenantId, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { new: true, session },
      );
      if (!updated) {
        throw new BadRequestException(`Insufficient stock for ${line.name}. Another bill may have just used it.`);
      }

      await this.stockLedgerModel.create(
        [
          {
            tenantId,
            outletId,
            productId: line.productId,
            movementType: 'OUTWARD_SALE',
            quantityDebit: line.quantity,
            quantityCredit: 0,
            balanceAfter: updated.stock,
            referenceType: 'ORDER',
            referenceId: invoiceNumber,
            remarks: `POS Sale: ${line.name} (${line.quantity} qty)`,
          },
        ],
        { session },
      );
    }
  }

  private async applyCustomerSale(
    tenantId: Types.ObjectId,
    customerId: Types.ObjectId,
    paymentMode: string,
    grandTotal: number,
    invoiceNumber: string,
    session?: ClientSession,
  ) {
    if (paymentMode !== 'CREDIT') {
      await this.customerModel.updateOne(
        { _id: customerId, tenantId },
        { $inc: { totalPurchasesCount: 1, totalSpent: grandTotal } },
        { session },
      );
      return;
    }

    // Re-check the limit atomically so two concurrent credit bills can't both pass.
    const updated = await this.customerModel.findOneAndUpdate(
      {
        _id: customerId,
        tenantId,
        $expr: { $lte: [{ $add: ['$currentCreditBalance', grandTotal] }, '$creditLimit'] },
      },
      { $inc: { currentCreditBalance: grandTotal, totalPurchasesCount: 1, totalSpent: grandTotal } },
      { new: true, session },
    );
    if (!updated) {
      throw new BadRequestException('Credit limit exceeded for this customer.');
    }

    await this.customerLedgerModel.create(
      [
        {
          tenantId,
          customerId,
          transactionType: 'DEBIT_SALE',
          amount: grandTotal,
          balanceAfter: round2(updated.currentCreditBalance),
          referenceType: 'ORDER',
          referenceId: invoiceNumber,
          remarks: `Khata / Credit Sale: ${invoiceNumber}`,
        },
      ],
      { session },
    );
  }

  private async resolveOutletId(tenant: TenantDocument, user: AuthenticatedUser): Promise<Types.ObjectId> {
    const userOutlet = ObjectIdUtil.toObjectIdOrNull(user.outletIds?.[0]);
    if (userOutlet) {
      return userOutlet;
    }
    if (tenant.primaryOutletId) {
      return tenant.primaryOutletId as Types.ObjectId;
    }
    const primary = await this.outletModel.findOne({ tenantId: tenant._id, isPrimary: true }).select('_id').lean();
    if (!primary) {
      throw new BadRequestException('This shop has no outlet configured.');
    }
    return primary._id as Types.ObjectId;
  }

  async listDeliveries(
    tenantIdStr: string,
    status?: string,
  ): Promise<{ items: Record<string, any>[]; summary: Record<string, number> }> {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const filter: Record<string, any> = { tenantId, isHomeDelivery: true };
    if (status && status !== 'ALL') {
      filter.deliveryStatus = status;
    }
    const [orders, counts] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
      this.orderModel.aggregate([
        { $match: { tenantId, isHomeDelivery: true } },
        { $group: { _id: '$deliveryStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const summary = {
      total: 0,
      pendingDispatch: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    counts.forEach((c) => {
      summary.total += c.count;
      if (c._id === 'PENDING_DISPATCH') summary.pendingDispatch = c.count;
      if (c._id === 'OUT_FOR_DELIVERY') summary.outForDelivery = c.count;
      if (c._id === 'DELIVERED') summary.delivered = c.count;
      if (c._id === 'CANCELLED') summary.cancelled = c.count;
    });

    return {
      items: orders.map((o) => ({ ...o, id: String(o._id) })),
      summary,
    };
  }

  async updateDelivery(tenantIdStr: string, idStr: string, dto: UpdateDeliveryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'order');
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) throw new NotFoundException('Order not found.');

    if (dto.deliveryStatus) {
      order.deliveryStatus = dto.deliveryStatus;
      if (dto.deliveryStatus === 'OUT_FOR_DELIVERY' && !order.dispatchedAt) {
        order.dispatchedAt = new Date();
      }
      if (dto.deliveryStatus === 'DELIVERED') {
        order.deliveredAt = new Date();
      }
    }
    if (dto.deliveryRiderName !== undefined) order.deliveryRiderName = dto.deliveryRiderName.trim();
    if (dto.deliveryRiderPhone !== undefined) order.deliveryRiderPhone = dto.deliveryRiderPhone.trim();
    if (dto.deliveryAddress !== undefined) order.deliveryAddress = dto.deliveryAddress.trim();

    await order.save();
    return { ...order.toObject(), id: String(order._id) };
  }

  private async findMaxInvoiceSeq(tenantId: Types.ObjectId, prefix: string, session?: ClientSession) {
    const last = await this.orderModel
      .findOne({ tenantId, invoiceNumber: { $regex: `^${prefix}` } })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .session(session ?? null)
      .lean();
    return SequenceService.parseSequence(last?.invoiceNumber);
  }
}
