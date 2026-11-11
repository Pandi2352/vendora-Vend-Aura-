import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { NumberUtil } from '../../common';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    return this.supplierModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: dto.name.trim(),
      contactPerson: dto.contactPerson?.trim(),
      phone: dto.phone.trim(),
      email: dto.email?.toLowerCase().trim(),
      gstin: dto.gstin?.toUpperCase().trim(),
      creditDays: dto.creditDays ?? 30,
      category: dto.category?.trim() || 'General',
      address: dto.address || {},
      balanceDue: 0,
      isActive: true,
    });
  }

  async getSuppliers(tenantId: string, search?: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { contactPerson: regex },
        { gstin: regex },
        { category: regex },
      ];
    }

    const suppliers = await this.supplierModel.find(filter).sort({ name: 1 }).lean();

    return suppliers.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      gstin: s.gstin,
      creditDays: s.creditDays,
      category: s.category,
      address: s.address,
      balanceDue: s.balanceDue,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }

  async getSupplierById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const supplier = await this.supplierModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!supplier) {
      throw new NotFoundException(`Supplier not found.`);
    }

    return supplier;
  }

  async updateSupplier(tenantId: string, id: string, dto: Partial<CreateSupplierDto>) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const updated = await this.supplierModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: dto },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`Supplier not found.`);
    }

    return updated;
  }

  async recordSupplierPayment(
    tenantId: string,
    supplierId: string,
    dto: RecordSupplierPaymentDto,
  ) {
    if (!Types.ObjectId.isValid(supplierId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const supplier = await this.supplierModel.findOne({
      _id: new Types.ObjectId(supplierId),
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found.`);
    }

    const newBalance = Math.max(0, NumberUtil.round(supplier.balanceDue - dto.amount, 2));
    await this.supplierModel.updateOne(
      { _id: supplier._id },
      { $set: { balanceDue: newBalance } },
    );

    return {
      success: true,
      supplierId: supplier._id.toString(),
      amountPaid: dto.amount,
      balanceDue: newBalance,
      referenceNumber: dto.referenceNumber,
    };
  }
}
