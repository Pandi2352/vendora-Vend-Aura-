import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { SupplierPayment, SupplierPaymentDocument } from './schemas/supplier-payment.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
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

const SORTABLE_FIELDS = ['name', 'balanceDue', 'createdAt'] as const;

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(SupplierPayment.name) private readonly paymentModel: Model<SupplierPaymentDocument>,
  ) {}

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const phone = this.normalizePhone(dto.phone);

    if (await this.supplierModel.exists({ tenantId: tenantObjectId, phone })) {
      throw new ConflictException(`Supplier with phone number ${phone} already exists.`);
    }

    const supplier = await this.supplierModel.create({
      tenantId: tenantObjectId,
      name: dto.name.trim(),
      contactPerson: dto.contactPerson?.trim(),
      phone,
      email: dto.email?.toLowerCase().trim(),
      gstin: dto.gstin,
      creditDays: dto.creditDays ?? 30,
      category: dto.category?.trim() || 'General',
      address: dto.address ?? {},
      balanceDue: 0,
    });
    return withId(supplier.toObject());
  }

  async getSuppliers(tenantId: string, query: SupplierQueryDto) {
    const filter: FilterQuery<SupplierDocument> = { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') };
    const regex = StringUtil.searchRegex(query.search);
    if (regex) {
      filter.$or = [{ name: regex }, { phone: regex }, { contactPerson: regex }, { gstin: regex }, { category: regex }];
    }

    const result = await PaginationUtil.paginate(this.supplierModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: PaginationUtil.resolveSort(query.sortBy, query.sortDirection, SORTABLE_FIELDS, { name: 1 }),
    });
    return { ...result, data: result.data.map(withId) };
  }

  async getSupplierById(tenantId: string, id: string) {
    const supplier = await this.supplierModel
      .findOne({ _id: ObjectIdUtil.toObjectId(id, 'supplier'), tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') })
      .lean();
    if (!supplier) {
      throw new NotFoundException('Supplier not found.');
    }
    return withId(supplier);
  }

  async updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const supplierId = ObjectIdUtil.toObjectId(id, 'supplier');
    const update: Partial<Supplier> = { ...dto } as Partial<Supplier>;

    if (dto.phone) {
      update.phone = this.normalizePhone(dto.phone);
      const clash = await this.supplierModel.exists({ tenantId: tenantObjectId, phone: update.phone, _id: { $ne: supplierId } });
      if (clash) {
        throw new ConflictException(`Supplier with phone number ${update.phone} already exists.`);
      }
    }
    if (dto.email) update.email = dto.email.toLowerCase().trim();
    if (dto.name) update.name = dto.name.trim();

    const updated = await this.supplierModel
      .findOneAndUpdate({ _id: supplierId, tenantId: tenantObjectId }, { $set: update }, { new: true })
      .lean();
    if (!updated) {
      throw new NotFoundException('Supplier not found.');
    }
    return withId(updated);
  }

  /** Pays down the supplier balance atomically and records it in the payables ledger. */
  async recordSupplierPayment(tenantId: string, supplierId: string, dto: RecordSupplierPaymentDto) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const supplierObjectId = ObjectIdUtil.toObjectId(supplierId, 'supplier');
    const amount = NumberUtil.round(dto.amount, 2);

    const supplier = await this.supplierModel.findOne({ _id: supplierObjectId, tenantId: tenantObjectId }).lean();
    if (!supplier) {
      throw new NotFoundException('Supplier not found.');
    }
    if (amount > NumberUtil.round(supplier.balanceDue, 2)) {
      throw new BadRequestException(`Payment ₹${amount} is more than the balance due ₹${supplier.balanceDue}.`);
    }

    const referenceNumber = dto.referenceNumber?.trim() || UuidUtil.generatePublicId('PAY');

    const { updated, payment } = await runInTransaction(this.connection, async (session) => {
      const updatedSupplier = await this.supplierModel.findOneAndUpdate(
        { _id: supplierObjectId, tenantId: tenantObjectId, balanceDue: { $gte: amount } },
        { $inc: { balanceDue: -amount } },
        { new: true, session },
      );
      if (!updatedSupplier) {
        throw new BadRequestException('Balance due changed. Please refresh and try again.');
      }
      const [created] = await this.paymentModel.create(
        [
          {
            tenantId: tenantObjectId,
            supplierId: supplierObjectId,
            amount,
            paymentMode: dto.paymentMode,
            referenceNumber,
            balanceAfter: NumberUtil.round(updatedSupplier.balanceDue, 2),
            notes: dto.notes?.trim(),
          },
        ],
        { session },
      );
      return { updated: updatedSupplier, payment: created };
    });

    this.logger.log(`Paid ₹${amount} to supplier ${updated.name}. Balance due: ₹${updated.balanceDue}`);
    return {
      supplierId: updated._id.toString(),
      amountPaid: amount,
      balanceDue: NumberUtil.round(updated.balanceDue, 2),
      referenceNumber,
      payment: withId(payment.toObject()),
    };
  }

  async getSupplierPayments(tenantId: string, supplierId: string, query: PaginationDto) {
    const result = await PaginationUtil.paginate(
      this.paymentModel,
      { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'), supplierId: ObjectIdUtil.toObjectId(supplierId, 'supplier') },
      { page: query.page, limit: query.limit, sort: { createdAt: -1 } },
    );
    return { ...result, data: result.data.map(withId) };
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
  }
}
