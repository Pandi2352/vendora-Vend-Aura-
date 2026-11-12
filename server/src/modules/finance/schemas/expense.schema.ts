import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  expenseNumber: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ required: true, trim: true })
  accountCode: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: ['CASH', 'BANK', 'UPI', 'CARD'], default: 'CASH' })
  paymentMode: string;

  @Prop({ required: true, default: '1010' })
  paymentAccountCode: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ default: '', trim: true })
  vendorName: string;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  expenseDate: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ tenantId: 1, outletId: 1, expenseDate: -1 });
ExpenseSchema.index({ tenantId: 1, expenseNumber: 1 }, { unique: true });

