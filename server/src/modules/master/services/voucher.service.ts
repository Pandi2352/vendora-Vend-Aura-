import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Voucher, VoucherDocument } from '../schemas/voucher.schema';
import { CreateVoucherDto, UpdateVoucherDto } from '../dto/voucher.dto';
import { OperationsSeedService } from './operations-seed.service';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name) private readonly voucherModel: Model<VoucherDocument>,
    private readonly seedService: OperationsSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensureVouchers(tenantId);
    return this.voucherModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateVoucherDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.voucherModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Voucher code ${code} is already used`);
    }

    return this.voucherModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateVoucherDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'voucher');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.voucherModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Voucher code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();

    const row = await this.voucherModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Gift voucher not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'voucher');

    const row = await this.voucherModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Gift voucher not found');
    return { success: true };
  }
}

