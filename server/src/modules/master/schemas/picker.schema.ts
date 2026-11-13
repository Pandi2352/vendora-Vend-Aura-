import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type PickerDocument = Picker & Document;

@Schema({ timestamps: true, collection: 'pickers' })
export class Picker extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 15 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ trim: true, default: '' })
  phone?: string;

  @Prop({ trim: true, default: '' })
  assignedZone?: string;

  @Prop({ default: true })
  active: boolean;
}

export const PickerSchema = SchemaFactory.createForClass(Picker);
PickerSchema.index({ tenantId: 1, code: 1 }, { unique: true });

