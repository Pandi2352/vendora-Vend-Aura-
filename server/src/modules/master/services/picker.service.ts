import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Picker, PickerDocument } from '../schemas/picker.schema';
import { CreatePickerDto, UpdatePickerDto } from '../dto/picker.dto';
import { OperationsSeedService } from './operations-seed.service';

@Injectable()
export class PickerService {
  constructor(
    @InjectModel(Picker.name) private readonly pickerModel: Model<PickerDocument>,
    private readonly seedService: OperationsSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensurePickers(tenantId);
    return this.pickerModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreatePickerDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.pickerModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Picker code ${code} is already used`);
    }

    return this.pickerModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdatePickerDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'picker');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.pickerModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Picker code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();

    const row = await this.pickerModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Picker not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'picker');

    const row = await this.pickerModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Picker not found');
    return { success: true };
  }
}
