import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type BarcodeTemplateDocument = BarcodeTemplate & Document;

@Schema({ timestamps: true, collection: 'barcode_templates' })
export class BarcodeTemplate extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 20 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ required: true, default: 50 })
  paperWidthMm: number;

  @Prop({ required: true, default: 25 })
  paperHeightMm: number;

  @Prop({ default: 1 })
  columns: number;

  @Prop({ trim: true, enum: ['thermal', 'laser', 'inkjet'], default: 'thermal' })
  printerType: string;

  @Prop({ default: true })
  showPrice: boolean;

  @Prop({ default: true })
  showBarcode: boolean;

  @Prop({ default: true })
  showStoreName: boolean;

  @Prop({ default: true })
  active: boolean;
}

export const BarcodeTemplateSchema = SchemaFactory.createForClass(BarcodeTemplate);
BarcodeTemplateSchema.index({ tenantId: 1, code: 1 }, { unique: true });

