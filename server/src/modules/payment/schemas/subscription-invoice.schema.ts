import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type SubscriptionInvoiceDocument = SubscriptionInvoice & Document;

@Schema({ timestamps: true, collection: 'subscription_invoices' })
export class SubscriptionInvoice extends TenantBaseEntity {
  @Prop({ required: true, trim: true, index: true })
  invoiceNumber: string;

  @Prop({ required: true, trim: true })
  sessionId: string;

  @Prop({ required: true, trim: true })
  planCode: string;

  @Prop({ required: true, enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' })
  billingCycle: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ required: true, default: 'PAID', index: true })
  status: string;

  @Prop({ default: 'STRIPE' })
  paymentMethod: string;

  @Prop({ type: Date, required: true, default: Date.now })
  paidAt: Date;

  @Prop({ default: '', trim: true })
  receiptUrl?: string;
}

export const SubscriptionInvoiceSchema = SchemaFactory.createForClass(SubscriptionInvoice);
SubscriptionInvoiceSchema.index({ tenantId: 1, paidAt: -1 });
SubscriptionInvoiceSchema.index({ tenantId: 1, sessionId: 1 }, { unique: true });

