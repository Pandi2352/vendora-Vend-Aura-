import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CashDrawerShiftDocument = CashDrawerShift & Document;

@Schema({ timestamps: true, collection: 'cash_drawer_shifts' })
export class CashDrawerShift {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ required: true, index: true })
  shiftNumber: string; // e.g. SHIFT-2026-00001

  @Prop({ required: true, trim: true })
  cashierName: string;

  @Prop({ default: Date.now })
  openedAt: Date;

  @Prop()
  closedAt?: Date;

  @Prop({ default: 0, min: 0 })
  openingFloat: number; // Starting physical cash in till

  @Prop({ default: 0 })
  expectedCash: number; // openingFloat + cashSales - cashRefunds

  @Prop({ default: 0 })
  actualCashCounted: number; // Cash physically counted at close

  @Prop({ default: 0 })
  variance: number; // actualCashCounted - expectedCash

  @Prop({ default: 0 })
  cashSalesTotal: number;

  @Prop({ default: 0 })
  upiSalesTotal: number;

  @Prop({ default: 0 })
  cardSalesTotal: number;

  @Prop({ default: 0 })
  creditSalesTotal: number;

  @Prop({ default: 0 })
  refundsTotal: number;

  @Prop({ default: 0 })
  billsCount: number;

  @Prop({ required: true, enum: ['OPEN', 'CLOSED'], default: 'OPEN' })
  status: 'OPEN' | 'CLOSED';

  @Prop({ trim: true })
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CashDrawerShiftSchema = SchemaFactory.createForClass(CashDrawerShift);
CashDrawerShiftSchema.index({ tenantId: 1, status: 1 });
CashDrawerShiftSchema.index({ tenantId: 1, openedAt: -1 });

