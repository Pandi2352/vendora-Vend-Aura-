import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product extends TenantBaseEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ required: true, trim: true, index: true })
  barcode: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  mrp: number;

  @Prop({ default: 0 })
  costPrice: number;

  @Prop({ default: 0, min: 0, max: 28 })
  taxRatePercent: number;

  @Prop({ default: 100 })
  stock: number;

  @Prop({ default: 'pcs' })
  unit: string;

  @Prop({ required: false, trim: true })
  batchNumber?: string;

  @Prop({ required: false, trim: true })
  expiryDate?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ tenantId: 1, barcode: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, name: 'text' });
