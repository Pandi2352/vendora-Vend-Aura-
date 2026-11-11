import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BusinessType, TenantStatus } from '../../../shared';
import { BaseEntity } from '../../../common';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true, collection: 'tenants' })
export class Tenant extends BaseEntity {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  shopId: string;

  @Prop({ required: true, trim: true })
  businessName: string;

  @Prop({ required: true, trim: true })
  ownerName: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, enum: Object.values(BusinessType) })
  businessType: BusinessType;

  @Prop({ required: true, enum: Object.values(TenantStatus), default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet' })
  primaryOutletId?: Types.ObjectId;

  @Prop({
    type: {
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      taxType: { type: String, default: 'GST' },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' },
      },
      gstin: { type: String, trim: true },
    },
    default: {},
  })
  settings: {
    currency: string;
    timezone: string;
    taxType: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    gstin?: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
