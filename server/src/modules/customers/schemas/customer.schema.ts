import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true, collection: 'customers' })
export class Customer extends TenantBaseEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  phone: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true, uppercase: true })
  gstin?: string;

  @Prop({ default: 5000, min: 0 })
  creditLimit: number; // Maximum Khata / Udhar allowed

  @Prop({ default: 0 })
  currentCreditBalance: number; // Outstanding Udhar balance owed by customer

  @Prop({ default: 0 })
  totalPurchasesCount: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    default: {},
  })
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  @Prop({ trim: true })
  notes?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, name: 1 });
CustomerSchema.index({ tenantId: 1, currentCreditBalance: -1 });
