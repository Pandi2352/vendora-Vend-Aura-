import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type StockAuditDocument = StockAudit & Document;

@Schema({ timestamps: true, collection: 'stock_audits' })
export class StockAudit extends TenantBaseEntity {
  @Prop({ required: true, trim: true, index: true })
  auditNumber: string;

  @Prop({ required: true, enum: ['DRAFT', 'RECONCILED'], default: 'DRAFT' })
  status: 'DRAFT' | 'RECONCILED';

  @Prop({ trim: true })
  auditedBy: string;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        barcode: { type: String, required: true },
        category: { type: String, default: '' },
        systemStock: { type: Number, required: true },
        physicalCount: { type: Number, required: true },
        varianceQty: { type: Number, required: true }, // physicalCount - systemStock
        unitCost: { type: Number, required: true },
        varianceValue: { type: Number, required: true }, // varianceQty * unitCost
      },
    ],
    default: [],
  })
  items: Array<{
    productId: Types.ObjectId;
    productName: string;
    barcode: string;
    category: string;
    systemStock: number;
    physicalCount: number;
    varianceQty: number;
    unitCost: number;
    varianceValue: number;
  }>;

  @Prop({ default: 0 })
  totalVarianceQty: number;

  @Prop({ default: 0 })
  totalVarianceValue: number;

  @Prop()
  reconciledAt?: Date;

  @Prop({ trim: true })
  notes?: string;
}

export const StockAuditSchema = SchemaFactory.createForClass(StockAudit);
StockAuditSchema.index({ tenantId: 1, createdAt: -1 });
