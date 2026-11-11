import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CustomerLedger, CustomerLedgerDocument } from './schemas/customer-ledger.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import {
  NumberUtil,
  ObjectIdUtil,
  PaginationDto,
  PaginationUtil,
  StringUtil,
  UuidUtil,
  runInTransaction,
  withId,
} from '../../common';

const SORTABLE_FIELDS = ['name', 'currentCreditBalance', 'totalSpent', 'createdAt'] as const;

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerLedger.name) private readonly ledgerModel: Model<CustomerLedgerDocument>,
  ) {}

  async createCustomer(tenantId: string, dto: CreateCustomerDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const phone = this.normalizePhone(dto.phone);

    if (await this.customerModel.exists({ tenantId: tenantObjectId, phone })) {
      throw new ConflictException(`Customer with phone number ${phone} already exists.`);
    }

    const customer = await this.customerModel.create({
      tenantId: tenantObjectId,
      name: dto.name.trim(),
      phone,
      email: dto.email?.toLowerCase().trim(),
      gstin: dto.gstin,
      creditLimit: dto.creditLimit ?? 5000,
      address: dto.address ?? {},
      notes: dto.notes?.trim(),
    });

    this.logger.log(`Created customer ${customer.name} (${StringUtil.maskPhone(phone)}) for tenant ${tenantId}`);
    return withId(customer.toObject());
  }

  async getCustomers(tenantId: string, query: CustomerQueryDto) {
    const filter: FilterQuery<CustomerDocument> = { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') };
    const regex = StringUtil.searchRegex(query.search);
    if (regex) {
      filter.$or = [{ name: regex }, { phone: regex }, { gstin: regex }];
    }

    const result = await PaginationUtil.paginate(this.customerModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: PaginationUtil.resolveSort(query.sortBy, query.sortDirection, SORTABLE_FIELDS, {
        currentCreditBalance: -1,
        name: 1,
      }),
    });
    return { ...result, data: result.data.map(withId) };
  }

  async getCustomerById(tenantId: string, id: string) {
    const customer = await this.customerModel
      .findOne({ _id: ObjectIdUtil.toObjectId(id, 'customer'), tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') })
      .lean();
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    return withId(customer);
  }

  async updateCustomer(tenantId: string, id: string, dto: UpdateCustomerDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const customerId = ObjectIdUtil.toObjectId(id, 'customer');
    const update: Partial<Customer> = { ...dto } as Partial<Customer>;

    if (dto.phone) {
      update.phone = this.normalizePhone(dto.phone);
      const clash = await this.customerModel.exists({ tenantId: tenantObjectId, phone: update.phone, _id: { $ne: customerId } });
      if (clash) {
        throw new ConflictException(`Customer with phone number ${update.phone} already exists.`);
      }
    }
    if (dto.email) update.email = dto.email.toLowerCase().trim();
    if (dto.name) update.name = dto.name.trim();

    const updated = await this.customerModel
      .findOneAndUpdate({ _id: customerId, tenantId: tenantObjectId }, { $set: update }, { new: true })
      .lean();
    if (!updated) {
      throw new NotFoundException('Customer not found.');
    }
    return withId(updated);
  }

  /** Khata repayment. Atomic: concurrent payments can't overwrite each other or over-collect. */
  async recordPayment(tenantId: string, customerId: string, dto: RecordCustomerPaymentDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const customerObjectId = ObjectIdUtil.toObjectId(customerId, 'customer');
    const amount = NumberUtil.round(dto.amount, 2);

    const customer = await this.customerModel.findOne({ _id: customerObjectId, tenantId: tenantObjectId }).lean();
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    if (amount > NumberUtil.round(customer.currentCreditBalance, 2)) {
      throw new BadRequestException(
        `Payment ₹${amount} is more than the outstanding khata balance ₹${customer.currentCreditBalance}.`,
      );
    }

    const referenceId = dto.referenceNumber?.trim() || UuidUtil.generatePublicId('RCP');

    const { updated, ledgerEntry } = await runInTransaction(this.connection, async (session) => {
      const updatedCustomer = await this.customerModel.findOneAndUpdate(
        { _id: customerObjectId, tenantId: tenantObjectId, currentCreditBalance: { $gte: amount } },
        { $inc: { currentCreditBalance: -amount } },
        { new: true, session },
      );
      if (!updatedCustomer) {
        throw new BadRequestException('Outstanding balance changed. Please refresh and try again.');
      }

      const [entry] = await this.ledgerModel.create(
        [
          {
            tenantId: tenantObjectId,
            customerId: customerObjectId,
            transactionType: 'CREDIT_PAYMENT',
            amount,
            balanceAfter: NumberUtil.round(updatedCustomer.currentCreditBalance, 2),
            referenceType: 'PAYMENT',
            referenceId,
            paymentMode: dto.paymentMode,
            remarks: dto.remarks || `Khata Repayment via ${dto.paymentMode}`,
          },
        ],
        { session },
      );
      return { updated: updatedCustomer, ledgerEntry: entry };
    });

    const balanceAfter = NumberUtil.round(updated.currentCreditBalance, 2);
    this.logger.log(`Customer ${updated.name} repaid ₹${amount}. Remaining khata: ₹${balanceAfter}`);

    return {
      customerId: updated._id.toString(),
      customerName: updated.name,
      amountPaid: amount,
      balanceAfter,
      receiptNumber: referenceId,
      ledgerEntry: withId(ledgerEntry.toObject()),
    };
  }

  async getCustomerLedger(tenantId: string, customerId: string, query: PaginationDto) {
    const filter = {
      tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'),
      customerId: ObjectIdUtil.toObjectId(customerId, 'customer'),
    };
    const result = await PaginationUtil.paginate(this.ledgerModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });
    return { ...result, data: result.data.map(withId) };
  }

  /** Stores the 10-digit national number only (drops +91 / leading 0). */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
  }
}
