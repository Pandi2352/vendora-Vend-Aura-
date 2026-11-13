import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true, collection: 'brands' })
export class Brand extends TenantBaseEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  code?: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
BrandSchema.index({ tenantId: 1, name: 1 }, { unique: true });

