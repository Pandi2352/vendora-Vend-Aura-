import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type OutletDocument = Outlet & Document;

@Schema({ timestamps: true, collection: 'outlets' })
export class Outlet extends TenantBaseEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, default: 'OUT-01' })
  code: string;

  @Prop({ default: true })
  isPrimary: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  incharge?: string;

  @Prop({ trim: true, uppercase: true })
  sortCode?: string;

  @Prop({ trim: true })
  address2?: string;

  @Prop({ trim: true })
  address3?: string;

  @Prop({ trim: true, uppercase: true })
  gstin?: string;

  @Prop({ trim: true })
  stateCode?: string;

  @Prop({ trim: true })
  fax?: string;

  @Prop({ default: false })
  isWarehouse?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse' })
  warehouseId?: Types.ObjectId;

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
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
OutletSchema.index({ tenantId: 1, code: 1 }, { unique: true });
