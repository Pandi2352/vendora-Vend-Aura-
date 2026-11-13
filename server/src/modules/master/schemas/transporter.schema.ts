import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransporterDocument = Transporter & Document;

@Schema({ timestamps: true })
export class Transporter {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  transporterId?: string;

  @Prop({ trim: true, default: '' })
  phone?: string;

  @Prop({ trim: true, default: '' })
  vehicleNumber?: string;

  @Prop({ trim: true, default: '' })
  address?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const TransporterSchema = SchemaFactory.createForClass(Transporter);
TransporterSchema.index({ tenantId: 1, code: 1 }, { unique: true });

