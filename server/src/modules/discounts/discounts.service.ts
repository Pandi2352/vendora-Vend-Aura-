import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectIdUtil, withId } from '../../common';
import { Discount, DiscountDocument } from './schemas/discount.schema';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';

const round2 = (num: number) => Math.round(num * 100) / 100;

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    @InjectModel(Discount.name) private readonly discountModel: Model<DiscountDocument>,
  ) {}

  async listDiscounts(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.ensureSeedDiscounts(tenantId);
    const docs = await this.discountModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
    return docs.map(withId);
  }

  async createDiscount(tenantIdStr: string, dto: CreateDiscountDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const exists = await this.discountModel.findOne({ tenantId, code }).lean();
    if (exists) {
      throw new ConflictException(`Offer code "${code}" already exists.`);
    }

    const doc = await this.discountModel.create({
      ...dto,
      tenantId,
      code,
      name: dto.name.trim(),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      usageCount: 0,
      isActive: dto.isActive ?? true,
    });
    return withId(doc.toObject());
  }

  async updateDiscount(tenantIdStr: string, idStr: string, dto: UpdateDiscountDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'discount');

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const duplicate = await this.discountModel.findOne({ tenantId, code, _id: { $ne: id } }).lean();
      if (duplicate) throw new ConflictException(`Offer code "${code}" is already in use.`);
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.startDate) payload.startDate = new Date(dto.startDate);
    if (dto.endDate) payload.endDate = new Date(dto.endDate);

    const updated = await this.discountModel.findOneAndUpdate({ _id: id, tenantId }, { $set: payload }, { new: true }).lean();
    if (!updated) throw new NotFoundException('Discount offer not found.');
    return withId(updated);
  }

  async deleteDiscount(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'discount');

    const deleted = await this.discountModel.findOneAndDelete({ _id: id, tenantId });
    if (!deleted) throw new NotFoundException('Discount offer not found.');
    return { success: true, message: 'Discount offer deleted' };
  }

  async validateCoupon(tenantIdStr: string, dto: ValidateDiscountDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const code = dto.code.trim().toUpperCase();

    const discount = await this.discountModel.findOne({ tenantId, code, isActive: true }).lean();
    if (!discount) {
      throw new BadRequestException(`Coupon code "${code}" is invalid or expired.`);
    }

    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      throw new BadRequestException(`Offer "${code}" has not started yet.`);
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      throw new BadRequestException(`Offer "${code}" expired on ${new Date(discount.endDate).toLocaleDateString('en-IN')}.`);
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      throw new BadRequestException(`Offer "${code}" has reached its maximum redemptions limit.`);
    }

    if (dto.orderAmount < (discount.minOrderValue || 0)) {
      throw new BadRequestException(
        `Minimum order amount of ₹${discount.minOrderValue} required for coupon "${code}" (current bill: ₹${dto.orderAmount}).`,
      );
    }

    if (discount.type === 'HAPPY_HOUR' && discount.happyHourStart && discount.happyHourEnd) {
      const timeStr = dto.currentTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (timeStr < discount.happyHourStart || timeStr > discount.happyHourEnd) {
        throw new BadRequestException(`Happy hour offer "${code}" is only valid between ${discount.happyHourStart} and ${discount.happyHourEnd}.`);
      }
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE' || discount.type === 'HAPPY_HOUR') {
      discountAmount = round2((dto.orderAmount * discount.value) / 100);
      if (discount.maxDiscountCap && discountAmount > discount.maxDiscountCap) {
        discountAmount = discount.maxDiscountCap;
      }
    } else if (discount.type === 'FLAT') {
      discountAmount = Math.min(discount.value, dto.orderAmount);
    } else {
      discountAmount = Math.min(discount.value, dto.orderAmount);
    }

    return {
      valid: true,
      code: discount.code,
      name: discount.name,
      type: discount.type,
      discountAmount,
      appliedRate: discount.value,
      description: `${discount.name} applied (-₹${discountAmount})`,
    };
  }

  async incrementUsage(tenantIdStr: string, code: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    await this.discountModel.updateOne({ tenantId, code: code.toUpperCase() }, { $inc: { usageCount: 1 } });
  }

  private async ensureSeedDiscounts(tenantId: unknown) {
    const count = await this.discountModel.countDocuments({ tenantId });
    if (count > 0) return;

    await this.discountModel.insertMany([
      {
        tenantId,
        code: 'WELCOME10',
        name: 'Welcome Shopper 10%',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 300,
        maxDiscountCap: 100,
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
      },
      {
        tenantId,
        code: 'FLAT50',
        name: 'Flat ₹50 Off on Groceries',
        type: 'FLAT',
        value: 50,
        minOrderValue: 500,
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
      },
      {
        tenantId,
        code: 'HAPPY20',
        name: 'Afternoon Happy Hour 20%',
        type: 'HAPPY_HOUR',
        value: 20,
        minOrderValue: 400,
        maxDiscountCap: 250,
        happyHourStart: '14:00',
        happyHourEnd: '17:00',
        usageCount: 0,
        isActive: true,
      },
    ]);
    this.logger.log(`✓ Seeded starter discount offers for tenant [${tenantId}]`);
  }
}
