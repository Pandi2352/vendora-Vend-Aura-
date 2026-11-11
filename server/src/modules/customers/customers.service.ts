import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from './schemas/customer-ledger.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly ledgerModel: Model<CustomerLedgerDocument>,
  ) {}

  /**
   * 1. Register a new Customer Profile
   */
  async createCustomer(tenantId: string, dto: CreateCustomerDto) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const tenantObjectId = new Types.ObjectId(tenantId);
    const cleanPhone = dto.phone.replace(/[^0-9]/g, '').slice(-10);

    const existing = await this.customerModel.findOne({
      tenantId: tenantObjectId,
      phone: cleanPhone,
    });

    if (existing) {
      throw new ConflictException(`Customer with phone number ${cleanPhone} already exists.`);
    }

    const customer = await this.customerModel.create({
      tenantId: tenantObjectId,
      name: dto.name.trim(),
      phone: cleanPhone,
      email: dto.email?.toLowerCase().trim(),
      gstin: dto.gstin?.toUpperCase().trim(),
      creditLimit: dto.creditLimit ?? 5000,
      currentCreditBalance: 0,
      totalPurchasesCount: 0,
      totalSpent: 0,
      address: dto.address || {},
      notes: dto.notes?.trim(),
      isActive: true,
    });

    this.logger.log(`Created customer: ${customer.name} (${customer.phone}) for tenant: ${tenantId}`);
    return customer;
  }

  /**
   * 2. List Customers with Search (by Name or Phone)
   */
  async getCustomers(tenantId: string, search?: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { gstin: regex },
      ];
    }

    const customers = await this.customerModel
      .find(filter)
      .sort({ currentCreditBalance: -1, name: 1 })
      .lean();

    return customers.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      phone: c.phone,
      email: c.email,
      gstin: c.gstin,
      creditLimit: c.creditLimit,
      currentCreditBalance: c.currentCreditBalance,
      totalPurchasesCount: c.totalPurchasesCount,
      totalSpent: c.totalSpent,
      address: c.address,
      notes: c.notes,
      isActive: c.isActive,
      createdAt: c.createdAt,
    }));
  }

  /**
   * 3. Single Customer Profile
   */
  async getCustomerById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const customer = await this.customerModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!customer) {
      throw new NotFoundException(`Customer not found.`);
    }

    return customer;
  }

  /**
   * 4. Update Customer Profile
   */
  async updateCustomer(tenantId: string, id: string, dto: Partial<CreateCustomerDto>) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const updateData: any = { ...dto };
    if (dto.phone) {
      updateData.phone = dto.phone.replace(/[^0-9]/g, '').slice(-10);
    }

    const updated = await this.customerModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: updateData },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`Customer not found.`);
    }

    return updated;
  }

  /**
   * 5. Record a Credit Sale (Khata / Udhar bill)
   */
  async recordCreditSale(
    tenantId: Types.ObjectId,
    customerId: Types.ObjectId,
    amount: number,
    invoiceNumber: string,
  ) {
    const customer = await this.customerModel.findOne({
      _id: customerId,
      tenantId,
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found.`);
    }

    const newBalance = customer.currentCreditBalance + amount;

    await this.customerModel.updateOne(
      { _id: customer._id },
      {
        $inc: {
          currentCreditBalance: amount,
          totalPurchasesCount: 1,
          totalSpent: amount,
        },
      },
    );

    // Append double-entry CustomerLedger debit sale record
    await this.ledgerModel.create({
      tenantId,
      customerId: customer._id,
      transactionType: 'DEBIT_SALE',
      amount,
      balanceAfter: newBalance,
      referenceType: 'ORDER',
      referenceId: invoiceNumber,
      remarks: `Credit Sale Invoice: ${invoiceNumber}`,
    });

    return { customerId: customer._id, newBalance };
  }

  /**
   * 6. Record Cash / Card / UPI Sale on Customer (updates spending telemetry)
   */
  async recordCashSale(
    tenantId: Types.ObjectId,
    customerId: Types.ObjectId,
    amount: number,
  ) {
    await this.customerModel.updateOne(
      { _id: customerId, tenantId },
      {
        $inc: {
          totalPurchasesCount: 1,
          totalSpent: amount,
        },
      },
    );
  }

  /**
   * 7. Record Customer Repayment / Settlement of Khata Balance
   */
  async recordPayment(
    tenantId: string,
    customerId: string,
    dto: RecordCustomerPaymentDto,
  ) {
    if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const tenantObjectId = new Types.ObjectId(tenantId);
    const customerObjectId = new Types.ObjectId(customerId);

    const customer = await this.customerModel.findOne({
      _id: customerObjectId,
      tenantId: tenantObjectId,
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found.`);
    }

    const newBalance = Math.max(0, customer.currentCreditBalance - dto.amount);

    await this.customerModel.updateOne(
      { _id: customer._id },
      { $set: { currentCreditBalance: newBalance } },
    );

    const refId = dto.referenceNumber || `RCP-${Date.now().toString().slice(-6)}`;

    // Append double-entry CustomerLedger credit payment record
    const ledgerEntry = await this.ledgerModel.create({
      tenantId: tenantObjectId,
      customerId: customer._id,
      transactionType: 'CREDIT_PAYMENT',
      amount: dto.amount,
      balanceAfter: newBalance,
      referenceType: 'PAYMENT',
      referenceId: refId,
      paymentMode: dto.paymentMode,
      remarks: dto.remarks || `Khata Repayment via ${dto.paymentMode}`,
    });

    this.logger.log(`Customer ${customer.name} repaid ₹${dto.amount}. Remaining Khata: ₹${newBalance}`);

    return {
      success: true,
      customerId: customer._id.toString(),
      customerName: customer.name,
      amountPaid: dto.amount,
      balanceAfter: newBalance,
      receiptNumber: refId,
      ledgerEntry,
    };
  }

  /**
   * 8. Retrieve Customer Khata Account Statement / Ledger History
   */
  async getCustomerLedger(tenantId: string, customerId: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const statement = await this.ledgerModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        customerId: new Types.ObjectId(customerId),
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return statement.map((s) => ({
      id: s._id.toString(),
      transactionType: s.transactionType,
      amount: s.amount,
      balanceAfter: s.balanceAfter,
      referenceType: s.referenceType,
      referenceId: s.referenceId,
      paymentMode: s.paymentMode,
      remarks: s.remarks,
      createdAt: s.createdAt,
    }));
  }
}
