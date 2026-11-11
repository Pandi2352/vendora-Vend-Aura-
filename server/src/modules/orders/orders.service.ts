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

  /**
   * Finalize POS Order:
   * 1. Generates sequential invoice number
   * 2. Atomically decrements product stock
   * 3. Appends double-entry StockLedger record
   * 4. Persists immutable Order document
   * 5. Atomically increments bills counter in Subscription
   */
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
      outletId = primaryOutlet ? primaryOutlet._id : null;
    }

    if (!outletId) {
      const anyOutlet = await this.outletModel.findOne({ tenantId });
      outletId = anyOutlet ? anyOutlet._id : new Types.ObjectId();
    }

    const cashierName = dto.cashierName || authUser?.fullName || authUser?.username || 'Cashier';

    // Sequential invoice numbering for this tenant
    const currentYear = new Date().getFullYear();
    const orderCount = await this.orderModel.countDocuments({ tenantId });
    const invoiceSeq = String(orderCount + 1).padStart(5, '0');
    const invoiceNumber = `INV-${currentYear}-${invoiceSeq}`;

    // Calculate tax splits
    const taxTotal = dto.taxTotal ?? 0;
    const cgst = dto.cgst ?? taxTotal / 2;
    const sgst = dto.sgst ?? taxTotal / 2;

    // Process Stock Movements and Ledger
    for (const item of dto.items) {
      let productIdObj: Types.ObjectId | null = null;
      if (Types.ObjectId.isValid(item.productId)) {
        productIdObj = new Types.ObjectId(item.productId);
      }

      let balanceAfter = 0;
      if (productIdObj) {
        const product = await this.productModel.findOne({ _id: productIdObj, tenantId });
        if (product) {
          balanceAfter = Math.max(0, product.stock - item.quantity);
          await this.productModel.updateOne(
            { _id: product._id },
            { $inc: { stock: -item.quantity } },
          );
        }
      }

      // Record double-entry StockLedger outward sale
      if (productIdObj) {
        await this.stockLedgerModel.create({
          tenantId,
          outletId,
          productId: productIdObj,
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

    // Customer & Khata/Credit Sale Tracking
    let customerIdObj: Types.ObjectId | null = null;
    let customerName = dto.customerName?.trim();
    let customerPhone = dto.customerPhone?.trim();

    if (dto.customerId && Types.ObjectId.isValid(dto.customerId)) {
      customerIdObj = new Types.ObjectId(dto.customerId);
      const customer = await this.customerModel.findOne({
        _id: customerIdObj,
        tenantId,
      });

      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;

        if (dto.paymentMode === 'CREDIT') {
          const newCreditBalance = customer.currentCreditBalance + dto.grandTotal;

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

          // Append double-entry CustomerLedger debit sale record
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
          // Cash, Card or UPI sale with customer attached
          await this.customerModel.updateOne(
            { _id: customer._id },
            {
              $inc: {
                totalPurchasesCount: 1,
                totalSpent: dto.grandTotal,
              },
            },
          );
        }
      }
    } else if (dto.paymentMode === 'CREDIT') {
      throw new BadRequestException('A registered customer is required to make a Credit / Khata sale.');
    }

    // Create Order
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

    // Atomically increment subscription billing metric
    if (tenant.subscriptionId) {
      await this.subscriptionModel.updateOne(
        { _id: tenant.subscriptionId },
        { $inc: { billsGeneratedThisMonth: 1 } },
      );
    }

    this.logger.log(`Order finalized: ${invoiceNumber} for Tenant: ${tenant.shopId} (₹${dto.grandTotal})`);

    return {
      success: true,
      order: {
        id: order._id.toString(),
        invoiceNumber: order.invoiceNumber,
        customerId: order.customerId?.toString(),
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        subTotal: order.subTotal,
        taxTotal: order.taxTotal,
        cgst: order.cgst,
        sgst: order.sgst,
        grandTotal: order.grandTotal,
        paymentMode: order.paymentMode,
        cashTendered: order.cashTendered,
        changeDue: order.changeDue,
        cashierName: order.cashierName,
        items: order.items,
        createdAt: order.createdAt,
      },
    };
  }

  /**
   * Retrieve Orders for a Tenant
   */
  async getOrders(tenantId: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const orders = await this.orderModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      invoiceNumber: o.invoiceNumber,
      customerId: o.customerId?.toString(),
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      subTotal: o.subTotal,
      taxTotal: o.taxTotal,
      cgst: o.cgst,
      sgst: o.sgst,
      grandTotal: o.grandTotal,
      paymentMode: o.paymentMode,
      cashTendered: o.cashTendered,
      changeDue: o.changeDue,
      cashierName: o.cashierName,
      status: o.status,
      itemsCount: o.items.length,
      items: o.items,
      createdAt: o.createdAt,
    }));
  }

  /**
   * Stock Movement Ledger Audit Trail
   */
  async getLedger(tenantId: string, limit: number = 100) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const ledger = await this.stockLedgerModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('productId', 'name barcode category')
      .lean();

    return ledger.map((l) => ({
      id: l._id.toString(),
      productId: l.productId,
      movementType: l.movementType,
      quantityDebit: l.quantityDebit,
      quantityCredit: l.quantityCredit,
      balanceAfter: l.balanceAfter,
      referenceType: l.referenceType,
      referenceId: l.referenceId,
      remarks: l.remarks,
      createdAt: l.createdAt,
    }));
  }

  /**
   * Single Order Details
   */
  async getOrderById(tenantId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      tenantId: new Types.ObjectId(tenantId),
    }).lean();

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    return order;
  }
}

