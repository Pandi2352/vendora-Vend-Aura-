import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type SupplierPaymentDocument = SupplierPayment & Document;

/** Audit trail of payments made to a supplier (payables ledger). */
@Schema({ timestamps: true, collection: 'supplier_payments' })
export class SupplierPayment extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] })
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

  @Prop({ required: true })
  referenceNumber: string;

  @Prop({ required: true })
  balanceAfter: number;

  @Prop({ trim: true })
  notes?: string;
}

export const SupplierPaymentSchema = SchemaFactory.createForClass(SupplierPayment);
SupplierPaymentSchema.index({ tenantId: 1, supplierId: 1, createdAt: -1 });
