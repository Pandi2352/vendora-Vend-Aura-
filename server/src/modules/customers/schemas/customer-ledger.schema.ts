import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type CustomerLedgerDocument = CustomerLedger & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'customer_ledgers' })
export class CustomerLedger extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['DEBIT_SALE', 'CREDIT_PAYMENT', 'OPENING_BALANCE', 'ADJUSTMENT'],
    index: true,
  })
  transactionType: 'DEBIT_SALE' | 'CREDIT_PAYMENT' | 'OPENING_BALANCE' | 'ADJUSTMENT';

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  balanceAfter: number; // Balance owed after this transaction

  @Prop({ required: true, enum: ['ORDER', 'PAYMENT', 'MANUAL'] })
  referenceType: 'ORDER' | 'PAYMENT' | 'MANUAL';

  @Prop({ required: true })
  referenceId: string; // Invoice number or payment transaction reference

  @Prop({ enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] })
  paymentMode?: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';

  @Prop({ trim: true })
  remarks?: string;
}

export const CustomerLedgerSchema = SchemaFactory.createForClass(CustomerLedger);
CustomerLedgerSchema.index({ tenantId: 1, customerId: 1, createdAt: -1 });
