import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type StockTransferDocument = StockTransfer & Document;

export type TransferStatus = 'PENDING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

@Schema({ _id: false })
export class StockTransferItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ required: true, trim: true })
  barcode: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  unitCost: number;

  @Prop({ required: true, default: 0 })
  totalCost: number;
}
export const StockTransferItemSchema = SchemaFactory.createForClass(StockTransferItem);

@Schema({ timestamps: true, collection: 'stock_transfers' })
export class StockTransfer extends TenantBaseEntity {
  @Prop({ required: true, index: true, uppercase: true })
  transferNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  sourceOutletId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  sourceOutletName: string;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  destinationOutletId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  destinationOutletName: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'DISPATCHED', 'RECEIVED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  })
  status: TransferStatus;

  @Prop({ type: [StockTransferItemSchema], required: true, default: [] })
  items: StockTransferItem[];

  @Prop({ required: true, default: 0 })
  totalQuantity: number;

  @Prop({ required: true, default: 0 })
  totalValue: number;

  @Prop()
  dispatchedAt?: Date;

  @Prop()
  receivedAt?: Date;

  @Prop({ trim: true })
  dispatchedBy?: string;

  @Prop({ trim: true })
  receivedBy?: string;

  @Prop({ trim: true })
  notes?: string;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
StockTransferSchema.index({ tenantId: 1, transferNumber: 1 });
StockTransferSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
