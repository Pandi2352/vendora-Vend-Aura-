import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type ParamDocument = ParamRecord & Document;

@Schema({ timestamps: true, collection: 'params' })
export class ParamRecord extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 30 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  description: string;

  @Prop({ required: true, trim: true })
  module: string;

  @Prop({ required: true, trim: true })
  valueType: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  value: string;

  @Prop({ default: true })
  active: boolean;
}

export const ParamSchema = SchemaFactory.createForClass(ParamRecord);
ParamSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ParamSchema.index({ tenantId: 1, module: 1 });
