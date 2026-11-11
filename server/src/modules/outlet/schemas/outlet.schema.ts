import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OutletDocument = Outlet & Document;

@Schema({ timestamps: true, collection: 'outlets' })
export class Outlet {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, default: 'OUT-01' })
  code: string;

  @Prop({ default: true })
  isPrimary: boolean;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    default: {},
  })
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
OutletSchema.index({ tenantId: 1, code: 1 }, { unique: true });

