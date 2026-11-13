import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true, collection: 'gift_vouchers' })
export class Voucher extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 20 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, trim: true, enum: ['flat', 'percentage'], default: 'flat' })
  voucherType: string;

  @Prop({ required: true, default: 100 })
  value: number;

  @Prop({ default: 0 })
  minBillAmount?: number;

  @Prop({ default: 90 })
  validityDays?: number;

  @Prop({ default: true })
  active: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
VoucherSchema.index({ tenantId: 1, code: 1 }, { unique: true });
