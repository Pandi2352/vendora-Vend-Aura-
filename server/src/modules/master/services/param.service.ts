import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { ParamDocument, ParamRecord } from '../schemas/param.schema';
import { CreateParamDto, UpdateParamDto } from '../dto/param.dto';

@Injectable()
export class ParamService {
  constructor(
    @InjectModel(ParamRecord.name) private readonly paramModel: Model<ParamDocument>,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    return this.paramModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ module: 1, code: 1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateParamDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.paramModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Parameter key ${code} is already used`);
    }

    return this.paramModel.create({
      ...dto,
      tenantId,
      code,
      description: dto.description.trim(),
      value: dto.value.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateParamDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'param');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.paramModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Parameter key ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.description) payload.description = dto.description.trim();
    if (dto.value !== undefined) payload.value = dto.value.trim();

    const row = await this.paramModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Parameter not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'param');

    const row = await this.paramModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Parameter not found');
    return { success: true };
  }
}
