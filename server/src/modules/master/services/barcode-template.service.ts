import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { BarcodeTemplate, BarcodeTemplateDocument } from '../schemas/barcode-template.schema';
import { CreateBarcodeTemplateDto, UpdateBarcodeTemplateDto } from '../dto/barcode-template.dto';
import { OperationsSeedService } from './operations-seed.service';

@Injectable()
export class BarcodeTemplateService {
  constructor(
    @InjectModel(BarcodeTemplate.name) private readonly barcodeModel: Model<BarcodeTemplateDocument>,
    private readonly seedService: OperationsSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensureBarcodeTemplates(tenantId);
    return this.barcodeModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateBarcodeTemplateDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.barcodeModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Barcode template code ${code} is already used`);
    }

    return this.barcodeModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateBarcodeTemplateDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'barcode-template');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.barcodeModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Barcode template code ${code} is already used`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();

    const row = await this.barcodeModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Barcode template not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'barcode-template');

    const row = await this.barcodeModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Barcode template not found');
    return { success: true };
  }
}

