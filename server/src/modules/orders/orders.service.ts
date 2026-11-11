import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { StockLedger, StockLedgerDocument } from './schemas/stock-ledger.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from '../customers/schemas/customer-ledger.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { DateUtil, NumberUtil } from '../../common';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly customerLedgerModel: Model<CustomerLedgerDocument>,
  ) {}

  async createOrder(
    dto: CreateOrderDto,
    authUser?: { userId?: string; tenantId?: string; outletIds?: string[]; fullName?: string; username?: string },
  ) {
    const rawTenantId = dto.tenantId || authUser?.tenantId;
    if (!rawTenantId) {
      throw new BadRequestException('Tenant ID is required to finalize order.');
    }

    const tenant = await this.tenantModel.findById(rawTenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${rawTenantId} not found.`);
    }

    const tenantId = tenant._id;

    // Resolve outlet
    let outletId: Types.ObjectId | null = null;
    const rawOutletId = dto.outletId || authUser?.outletIds?.[0];
    if (rawOutletId && Types.ObjectId.isValid(rawOutletId)) {
      outletId = new Types.ObjectId(rawOutletId);
    } else if (tenant.primaryOutletId) {
      outletId = tenant.primaryOutletId as Types.ObjectId;
    } else {
      const primaryOutlet = await this.outletModel.findOne({ tenantId, isPrimary: true });
      outletId = primaryOutlet ? primaryOutlet._id : new Types.ObjectId();
    }

    const cashierName = dto.cashierName || authUser?.fullName || authUser?.username || 'Cashier';

    // Sequential invoice numbering: INV-YYYY-XXXXX
    const currentYear = DateUtil.nowUtc().getFullYear();
    const orderCount = await this.orderModel.countDocuments({ tenantId });
    const invoiceSeq = String(orderCount + 1).padStart(5, '0');
    const invoiceNumber = `INV-${currentYear}-${invoiceSeq}`;

    const taxTotal = NumberUtil.round(dto.taxTotal ?? 0, 2);
    const cgst = NumberUtil.round(dto.cgst ?? taxTotal / 2, 2);
    const sgst = NumberUtil.round(dto.sgst ?? taxTotal / 2, 2);

    // 1. Process Stock Movement & Ledger
    for (const item of dto.items) {
      if (Types.ObjectId.isValid(item.productId)) {
        const prodId = new Types.ObjectId(item.productId);
        const product = await this.productModel.findOne({ _id: prodId, tenantId });
        if (product) {
          const balanceAfter = Math.max(0, product.stock - item.quantity);
          await this.productModel.updateOne({ _id: prodId }, { $inc: { stock: -item.quantity } });

          await this.stockLedgerModel.create({
            tenantId,
            outletId,
            productId: prodId,
            movementType: 'OUTWARD_SALE',
            quantityDebit: item.quantity,
            quantityCredit: 0,
            balanceAfter,
            referenceType: 'ORDER',
            referenceId: invoiceNumber,
            remarks: `POS Sale: ${item.name} (${item.quantity} qty)`,
          });
        }
      }
    }

    // 2. Customer Khata / Credit tracking
    let customerIdObj: Types.ObjectId | null = null;
    let customerName = dto.customerName?.trim();
    let customerPhone = dto.customerPhone?.trim();

    if (dto.customerId && Types.ObjectId.isValid(dto.customerId)) {
      customerIdObj = new Types.ObjectId(dto.customerId);
      const customer = await this.customerModel.findOne({ _id: customerIdObj, tenantId });

      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;

        if (dto.paymentMode === 'CREDIT') {
          const newCreditBalance = NumberUtil.round(customer.currentCreditBalance + dto.grandTotal, 2);
          await this.customerModel.updateOne(
            { _id: customer._id },
            {
              $inc: {
                currentCreditBalance: dto.grandTotal,
                totalPurchasesCount: 1,
                totalSpent: dto.grandTotal,
              },
            },
          );

          await this.customerLedgerModel.create({
            tenantId,
            customerId: customer._id,
            transactionType: 'DEBIT_SALE',
            amount: dto.grandTotal,
            balanceAfter: newCreditBalance,
            referenceType: 'ORDER',
            referenceId: invoiceNumber,
            remarks: `Khata / Credit Sale: ${invoiceNumber}`,
          });
        } else {
          await this.customerModel.updateOne(
            { _id: customer._id },
            { $inc: { totalPurchasesCount: 1, totalSpent: dto.grandTotal } },
          );
        }
      }
    } else if (dto.paymentMode === 'CREDIT') {
      throw new BadRequestException('A registered customer is required to make a Credit / Khata sale.');
    }

    // 3. Create Immutable Order
    const order = await this.orderModel.create({
      tenantId,
      outletId,
      invoiceNumber,
      customerId: customerIdObj,
      customerName,
      customerPhone,
      items: dto.items,
      subTotal: dto.subTotal,
      taxTotal,
      cgst,
      sgst,
      grandTotal: dto.grandTotal,
      paymentMode: dto.paymentMode,
      cashTendered: dto.cashTendered ?? dto.grandTotal,
      changeDue: dto.changeDue ?? 0,
      cashierName,
      status: 'COMPLETED',
    });

    if (tenant.subscriptionId) {
      await this.subscriptionModel.updateOne(
        { _id: tenant.subscriptionId },
        { $inc: { billsGeneratedThisMonth: 1 } },
      );
    }

    this.logger.log(`Order finalized: ${invoiceNumber} for Tenant: ${tenant.shopId} (₹${dto.grandTotal})`);
    return { success: true, order };
  }

  async getOrders(tenantId: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    return this.orderModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getLedger(tenantId: string, limit: number = 100) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    return this.stockLedgerModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('productId', 'name barcode category')
      .lean();
  }

  async getOrderById(tenantId: string, orderId: string) {
    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    return order;
  }
}
