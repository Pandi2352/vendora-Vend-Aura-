import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil } from '../../../common';
import { Territory, TerritoryDocument } from '../schemas/territory.schema';
import { CreateTerritoryDto, UpdateTerritoryDto } from '../dto/territory.dto';
import { MasterSeedService } from './master-seed.service';

@Injectable()
export class TerritoryService {
  constructor(
    @InjectModel(Territory.name) private readonly territoryModel: Model<TerritoryDocument>,
    private readonly seedService: MasterSeedService,
  ) {}

  async list(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.seedService.ensureTerritories(tenantId);
    return this.territoryModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .sort({ code: 1 })
      .lean();
  }

  async create(tenantIdStr: string, dto: CreateTerritoryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.territoryModel.findOne({
      tenantId,
      code,
      isDeleted: { $ne: true },
    }).lean();

    if (exists) {
      throw new ConflictException(`Territory code ${code} is already used`);
    }

    const parentId = dto.parentId ? ObjectIdUtil.toObjectIdOrNull(dto.parentId) : null;
    if (parentId) {
      const parent = await this.territoryModel.findOne({ _id: parentId, tenantId }).lean();
      if (!parent) throw new NotFoundException('Parent territory not found');
      if (!parent.isGroup) throw new BadRequestException('Selected parent is not a group territory');
    }

    return this.territoryModel.create({
      tenantId,
      code,
      name: dto.name.trim(),
      parentId,
      isGroup: dto.isGroup ?? false,
      active: dto.active ?? true,
    });
  }

  async update(tenantIdStr: string, idStr: string, dto: UpdateTerritoryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'territory');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.territoryModel.findOne({
        tenantId,
        code,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`Territory code ${code} is already used`);
      }
    }

    if (dto.isGroup === false) {
      const hasChildren = await this.territoryModel.exists({
        tenantId,
        parentId: id,
        isDeleted: { $ne: true },
      });
      if (hasChildren) {
        throw new BadRequestException('Move or delete the territories under this group first');
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.name) payload.name = dto.name.trim();
    if (dto.parentId !== undefined) {
      payload.parentId = dto.parentId ? ObjectIdUtil.toObjectIdOrNull(dto.parentId) : null;
      if (payload.parentId && payload.parentId.toString() === id.toString()) {
        throw new BadRequestException('A territory cannot be its own parent');
      }
    }

    const row = await this.territoryModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    );
    if (!row) throw new NotFoundException('Territory not found');
    return row;
  }

  async remove(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'territory');

    const hasChildren = await this.territoryModel.exists({
      tenantId,
      parentId: id,
      isDeleted: { $ne: true },
    });
    if (hasChildren) {
      throw new BadRequestException('Move or delete the territories under this group first');
    }

    const row = await this.territoryModel.findOneAndDelete({ _id: id, tenantId });
    if (!row) throw new NotFoundException('Territory not found');
    return { success: true };
  }
}
