import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type StockTransferDocument = StockTransfer & Document;

@Schema({ _id: false })
export class TransferItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ required: true, trim: true })
  barcode: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: 'pcs', trim: true })
  unit: string;
}

@Schema({ timestamps: true, collection: 'stock_transfers' })
export class StockTransfer extends TenantBaseEntity {
  @Prop({ required: true, trim: true, index: true })
  transferNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  sourceOutletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  destinationOutletId: Types.ObjectId;

  @Prop({ type: [TransferItem], required: true })
  items: TransferItem[];

  @Prop({
    required: true,
    enum: ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'],
    default: 'IN_TRANSIT',
    index: true,
  })
  status: string;

  @Prop({ type: Date, required: true, default: Date.now })
  dispatchDate: Date;

  @Prop({ type: Date, default: null })
  receivedDate?: Date;

  @Prop({ default: '', trim: true })
  notes?: string;
}

export const StockTransferSchema = SchemaFactory.createForClass(StockTransfer);
StockTransferSchema.index({ tenantId: 1, transferNumber: 1 }, { unique: true });
StockTransferSchema.index({ tenantId: 1, sourceOutletId: 1, destinationOutletId: 1 });

