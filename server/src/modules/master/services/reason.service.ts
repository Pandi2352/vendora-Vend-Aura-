import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Reason, ReasonDocument } from '../schemas/reason.schema';
import { CreateReasonDto, UpdateReasonDto } from '../dto/reason.dto';
import { MasterSeedService } from './master-seed.service';

@Injectable()
export class ReasonService {
  constructor(
    @InjectModel(Reason.name) private readonly reasonModel: Model<ReasonDocument>,
    private readonly seedService: MasterSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensureReasons(tenantId);
    return this.reasonModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateReasonDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.reasonModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Reason code ${code} is already used`);
    }

    return this.reasonModel.create({
      ...dto,
      tenantId,
      code,
      description: dto.description.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateReasonDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'reason');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.reasonModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Reason code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.description) payload.description = dto.description.trim();

    const row = await this.reasonModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Reason not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'reason');

    const row = await this.reasonModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Reason not found');
    return { success: true };
  }
}
