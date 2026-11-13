import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Freight, FreightDocument } from '../schemas/freight.schema';
import { CreateFreightDto, UpdateFreightDto } from '../dto/freight.dto';
import { OperationsSeedService } from './operations-seed.service';

@Injectable()
export class FreightService {
  constructor(
    @InjectModel(Freight.name) private readonly freightModel: Model<FreightDocument>,
    private readonly seedService: OperationsSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensureFreight(tenantId);
    return this.freightModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateFreightDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.freightModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Freight code ${code} is already used`);
    }

    return this.freightModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateFreightDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'freight');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.freightModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Freight code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();

    const row = await this.freightModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Freight charge rule not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'freight');

    const row = await this.freightModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Freight charge rule not found');
    return { success: true };
  }
}
