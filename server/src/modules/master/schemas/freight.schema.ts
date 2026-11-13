import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type FreightDocument = Freight & Document;

@Schema({ timestamps: true, collection: 'freight_charges' })
export class Freight extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 15 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, trim: true, enum: ['flat', 'per-kg', 'percentage'], default: 'flat' })
  rateType: string;

  @Prop({ required: true, default: 0 })
  rate: number;

  @Prop({ default: 0 })
  minAmount?: number;

  @Prop({ trim: true, enum: ['all', 'sales', 'purchase', 'transfer'], default: 'all' })
  applicableOn: string;

  @Prop({ default: true })
  active: boolean;
}

export const FreightSchema = SchemaFactory.createForClass(Freight);
FreightSchema.index({ tenantId: 1, code: 1 }, { unique: true });

