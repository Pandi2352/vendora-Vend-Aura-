import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

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

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ tenantId: 1, barcode: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, name: 'text' });

