import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type DiscountDocument = Discount & Document;

export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y' | 'HAPPY_HOUR';

@Schema({ timestamps: true, collection: 'discounts' })
export class Discount extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    enum: ['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y', 'HAPPY_HOUR'],
    default: 'PERCENTAGE',
  })
  type: DiscountType;

  @Prop({ required: true, min: 0 })
  value: number; // e.g. 20 for 20%, or 100 for ₹100 flat

  @Prop({ default: 0, min: 0 })
  minOrderValue: number;

  @Prop({ min: 0 })
  maxDiscountCap?: number; // Cap for percentage discounts (in ₹)

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ trim: true })
  happyHourStart?: string; // "14:00"

  @Prop({ trim: true })
  happyHourEnd?: string; // "17:00"

  @Prop({ min: 0 })
  usageLimit?: number;

  @Prop({ default: 0, min: 0 })
  usageCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
DiscountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
DiscountSchema.index({ tenantId: 1, isActive: 1 });
