import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Outlet, OutletDocument } from './schemas/outlet.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { ObjectIdUtil } from '../../common';

@Injectable()
export class OutletService {
  constructor(
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async listOutlets(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    return this.outletModel.find({ tenantId, isDeleted: { $ne: true } }).sort({ isPrimary: -1, createdAt: 1 }).lean();
  }

  async createOutlet(tenantIdStr: string, dto: CreateOutletDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');

    const [subscription, activeCount, existingCode] = await Promise.all([
      this.subscriptionModel.findOne({ tenantId }).lean(),
      this.outletModel.countDocuments({ tenantId, isDeleted: { $ne: true } }),
      this.outletModel.findOne({ tenantId, code: dto.code.trim().toUpperCase(), isDeleted: { $ne: true } }).lean(),
    ]);

    if (existingCode) {
      throw new ConflictException(`An outlet with code "${dto.code.toUpperCase()}" already exists in your store.`);
    }

    const maxOutlets = subscription?.maxOutlets || 1;
    if (activeCount >= maxOutlets) {
      throw new BadRequestException(
        `Outlet limit of ${maxOutlets} reached for your plan. Upgrade your plan to Growth or Business to add more locations.`,
      );
    }

    const outlet = await this.outletModel.create({
      tenantId,
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      isPrimary: activeCount === 0,
      phone: dto.phone?.trim() || '',
      email: dto.email?.trim().toLowerCase() || '',
      incharge: dto.incharge?.trim() || '',
      sortCode: dto.sortCode?.trim().toUpperCase() || '',
      address2: dto.address2?.trim() || '',
      address3: dto.address3?.trim() || '',
      gstin: dto.gstin?.trim().toUpperCase() || '',
      stateCode: dto.stateCode?.trim() || '',
      fax: dto.fax?.trim() || '',
      isWarehouse: dto.isWarehouse ?? false,
      warehouseId: dto.warehouseId ? ObjectIdUtil.toObjectIdOrNull(dto.warehouseId) : undefined,
      address: dto.address || {},
      isActive: dto.isActive ?? true,
    });

    return outlet;
  }

  async updateOutlet(tenantIdStr: string, outletIdStr: string, dto: Partial<CreateOutletDto>) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const outletId = ObjectIdUtil.toObjectId(outletIdStr, 'outlet');

    const updatePayload: Record<string, unknown> = { ...dto };
    if (dto.code) updatePayload.code = dto.code.trim().toUpperCase();
    if (dto.name) updatePayload.name = dto.name.trim();
    if (dto.warehouseId !== undefined) {
      updatePayload.warehouseId = dto.warehouseId ? ObjectIdUtil.toObjectIdOrNull(dto.warehouseId) : null;
    }

    const outlet = await this.outletModel.findOneAndUpdate(
      { _id: outletId, tenantId },
      { $set: updatePayload },
      { new: true },
    );

    if (!outlet) throw new NotFoundException('Outlet not found.');
    return outlet;
  }

  async deleteOutlet(tenantIdStr: string, outletIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const outletId = ObjectIdUtil.toObjectId(outletIdStr, 'outlet');

    const outlet = await this.outletModel.findOneAndUpdate(
      { _id: outletId, tenantId },
      { $set: { isActive: false, isDeleted: true } },
      { new: true },
    );

    if (!outlet) throw new NotFoundException('Outlet not found.');
    return { success: true, message: 'Outlet deleted' };
  }
}

