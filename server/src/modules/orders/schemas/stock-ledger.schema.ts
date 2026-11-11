import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockLedgerDocument = StockLedger & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'stock_ledgers' })
export class StockLedger {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['OPENING', 'INWARD_PURCHASE', 'OUTWARD_SALE', 'ADJUSTMENT', 'RETURN'],
    index: true,
  })
  movementType: 'OPENING' | 'INWARD_PURCHASE' | 'OUTWARD_SALE' | 'ADJUSTMENT' | 'RETURN';

  @Prop({ default: 0, min: 0 })
  quantityDebit: number; // Stock reduction (sale)

  @Prop({ default: 0, min: 0 })
  quantityCredit: number; // Stock addition (purchase/opening)

  @Prop({ required: true })
  balanceAfter: number; // Balance after transaction

  @Prop({ required: true, enum: ['ORDER', 'GRN', 'ADJUSTMENT', 'MANUAL'] })
  referenceType: 'ORDER' | 'GRN' | 'ADJUSTMENT' | 'MANUAL';

  @Prop({ required: true })
  referenceId: string;

  @Prop()
  remarks?: string;

  createdAt?: Date;
}

export const StockLedgerSchema = SchemaFactory.createForClass(StockLedger);
StockLedgerSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });

