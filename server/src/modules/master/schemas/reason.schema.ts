import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type ReasonDocument = Reason & Document;

@Schema({ timestamps: true, collection: 'reasons' })
export class Reason extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true, maxlength: 15 })
  code: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  description: string;

  @Prop({ trim: true, maxlength: 60 })
  reasonFor?: string;

  @Prop({ required: true, trim: true })
  transactionType: string;

  @Prop({ required: true, trim: true })
  effect: string;

  @Prop({ default: true })
  active: boolean;
}

export const ReasonSchema = SchemaFactory.createForClass(Reason);
ReasonSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ReasonSchema.index({ tenantId: 1, transactionType: 1 });
