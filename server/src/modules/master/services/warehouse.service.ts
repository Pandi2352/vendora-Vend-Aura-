import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Warehouse, WarehouseDocument } from '../schemas/warehouse.schema';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<WarehouseDocument>,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    return this.warehouseModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateWarehouseDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.warehouseModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Code ${code} is already used`);
    }

    return this.warehouseModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateWarehouseDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'warehouse');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.warehouseModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();

    const row = await this.warehouseModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Warehouse not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'warehouse');

    const row = await this.warehouseModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Warehouse not found');
    return { success: true };
  }
}
