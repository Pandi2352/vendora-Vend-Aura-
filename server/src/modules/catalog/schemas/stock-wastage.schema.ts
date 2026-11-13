import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type StockWastageDocument = StockWastage & Document;

export type WastageReason =
  | 'EXPIRED'
  | 'DAMAGED_IN_TRANSIT'
  | 'CUSTOMER_RETURN_DEFECTIVE'
  | 'THEFT_SHRINKAGE'
  | 'HANDLING_SPOILAGE'
  | 'OTHER';

@Schema({ timestamps: true, collection: 'stock_wastages' })
export class StockWastage extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  productName: string;

  @Prop({ required: true, trim: true })
  barcode: string;

  @Prop({ required: true, min: 0.001 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitCost: number;

  @Prop({ required: true, min: 0 })
  totalLoss: number; // quantity * unitCost

  @Prop({
    required: true,
    enum: [
      'EXPIRED',
      'DAMAGED_IN_TRANSIT',
      'CUSTOMER_RETURN_DEFECTIVE',
      'THEFT_SHRINKAGE',
      'HANDLING_SPOILAGE',
      'OTHER',
    ],
    default: 'EXPIRED',
  })
  reason: WastageReason;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ trim: true })
  reportedBy?: string;
}

export const StockWastageSchema = SchemaFactory.createForClass(StockWastage);
StockWastageSchema.index({ tenantId: 1, createdAt: -1 });

