import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true, collection: 'suppliers' })
export class Supplier extends TenantBaseEntity {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ trim: true })
  contactPerson?: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true, uppercase: true })
  gstin?: string;

  @Prop({ default: 30 })
  creditDays: number;

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

  @Prop({ default: 'General' })
  category: string;

  @Prop({ default: 0 })
  balanceDue: number; // Outstanding amount owed to supplier
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ tenantId: 1, name: 1 });
SupplierSchema.index({ tenantId: 1, phone: 1 });
