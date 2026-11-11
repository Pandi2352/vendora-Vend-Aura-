import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderReturn, OrderReturnDocument } from './schemas/order-return.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { StockLedger, StockLedgerDocument } from './schemas/stock-ledger.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from '../customers/schemas/customer-ledger.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { CreateReturnDto } from './dto/create-return.dto';
import { DateUtil, NumberUtil } from '../../common';

@Injectable()
export class OrderReturnsService {
  private readonly logger = new Logger(OrderReturnsService.name);

  constructor(
    @InjectModel(OrderReturn.name) private readonly returnModel: Model<OrderReturnDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly customerLedgerModel: Model<CustomerLedgerDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
  ) {}

  async createReturn(
    dto: CreateReturnDto,
    authUser?: { userId?: string; tenantId?: string; outletIds?: string[]; fullName?: string; username?: string },
  ) {
    const rawTenantId = dto.tenantId || authUser?.tenantId;
    if (!rawTenantId || !Types.ObjectId.isValid(rawTenantId)) {
      throw new BadRequestException('Valid tenant ID is required.');
    }
    const tenantId = new Types.ObjectId(rawTenantId);

    // Verify invoice exists
    const order = await this.orderModel.findOne({
      tenantId,
      invoiceNumber: dto.originalInvoiceNumber,
    });
    if (!order) {
      throw new NotFoundException(`Invoice ${dto.originalInvoiceNumber} not found.`);
    }

    // Resolve outlet
    let outletId = order.outletId;
    if (!outletId) {
      const tenant = await this.tenantModel.findById(tenantId);
      outletId = tenant?.primaryOutletId as Types.ObjectId;
      if (!outletId) {
        const anyOutlet = await this.outletModel.findOne({ tenantId });
        outletId = anyOutlet ? anyOutlet._id : new Types.ObjectId();
      }
    }

    // Generate sequential Return number: RET-YYYY-XXXXX
    const currentYear = DateUtil.nowUtc().getFullYear();
    const returnCount = await this.returnModel.countDocuments({ tenantId });
    const returnSeq = String(returnCount + 1).padStart(5, '0');
    const returnNumber = `RET-${currentYear}-${returnSeq}`;

    const cashierName = dto.cashierName || authUser?.fullName || authUser?.username || 'Cashier';

    // 1. Restore Inventory Stock and Append StockLedger records
    for (const item of dto.items) {
      if (Types.ObjectId.isValid(item.productId)) {
        const prodId = new Types.ObjectId(item.productId);
        const product = await this.productModel.findOne({ _id: prodId, tenantId });
        if (product) {
          const balanceAfter = product.stock + item.quantityReturned;
          await this.productModel.updateOne(
            { _id: prodId },
            { $inc: { stock: item.quantityReturned } },
          );

          await this.stockLedgerModel.create({
            tenantId,
            outletId,
            productId: prodId,
            movementType: 'INWARD_RETURN',
            quantityDebit: 0,
            quantityCredit: item.quantityReturned,
            balanceAfter,
            referenceType: 'ORDER',
            referenceId: returnNumber,
            remarks: `Sales Return [${item.reason}]: ${item.name} (${item.quantityReturned} qty) from ${order.invoiceNumber}`,
          });
        }
      }
    }

    // 2. Customer Khata Credit adjustment if returned to ledger
    let customerIdObj: Types.ObjectId | undefined = order.customerId;
    if (dto.customerId && Types.ObjectId.isValid(dto.customerId)) {
      customerIdObj = new Types.ObjectId(dto.customerId);
    }

    if (dto.refundMode === 'CUSTOMER_KHATA' && customerIdObj) {
      const customer = await this.customerModel.findOne({ _id: customerIdObj, tenantId });
      if (customer) {
        const newCreditBalance = Math.max(0, customer.currentCreditBalance - dto.totalRefundAmount);
        await this.customerModel.updateOne(
          { _id: customerIdObj },
          { $inc: { currentCreditBalance: -dto.totalRefundAmount } },
        );

        await this.customerLedgerModel.create({
          tenantId,
          customerId: customerIdObj,
          transactionType: 'CREDIT_PAYMENT',
          amount: dto.totalRefundAmount,
          balanceAfter: newCreditBalance,
          referenceType: 'PAYMENT',
          referenceId: returnNumber,
          remarks: `Refund Khata adjustment for return ${returnNumber}`,
        });
      }
    }

    // 3. Persist OrderReturn Record
    const orderReturn = await this.returnModel.create({
      tenantId,
      outletId,
      orderId: order._id,
      originalInvoiceNumber: dto.originalInvoiceNumber,
      returnNumber,
      items: dto.items.map((it) => ({
        productId: new Types.ObjectId(it.productId),
        name: it.name,
        barcode: it.barcode,
        quantityReturned: it.quantityReturned,
        unitPrice: it.unitPrice,
        taxRatePercent: it.taxRatePercent || 0,
        refundAmount: it.refundAmount,
        reason: it.reason,
      })),
      totalRefundAmount: dto.totalRefundAmount,
      refundMode: dto.refundMode,
      customerId: customerIdObj,
      customerName: dto.customerName || order.customerName,
      customerPhone: dto.customerPhone || order.customerPhone,
      cashierName,
      remarks: dto.remarks,
    });

    this.logger.log(`Sales return ${returnNumber} processed for ₹${dto.totalRefundAmount} [${order.invoiceNumber}]`);
    return { success: true, return: orderReturn };
  }

  async getReturns(tenantId: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }
    return this.returnModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getReturnsByInvoice(tenantId: string, invoiceNumber: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }
    return this.returnModel
      .find({ tenantId: new Types.ObjectId(tenantId), originalInvoiceNumber: invoiceNumber })
      .sort({ createdAt: -1 })
      .lean();
  }
}

