import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type OrderReturnDocument = OrderReturn & Document;

@Schema({ timestamps: true, collection: 'order_returns' })
export class OrderReturn extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, index: true })
  originalInvoiceNumber: string;

  @Prop({ required: true, index: true })
  returnNumber: string; // e.g. RET-2026-00001

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        barcode: { type: String, required: true },
        quantityReturned: { type: Number, required: true, min: 0.001 },
        unitPrice: { type: Number, required: true, min: 0 },
        taxRatePercent: { type: Number, default: 0 },
        refundAmount: { type: Number, required: true, min: 0 },
        reason: {
          type: String,
          enum: ['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'],
          default: 'CUSTOMER_REQUEST',
        },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    barcode: string;
    quantityReturned: number;
    unitPrice: number;
    taxRatePercent: number;
    refundAmount: number;
    reason: 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST';
  }>;

  @Prop({ required: true, min: 0 })
  totalRefundAmount: number;

  @Prop({ required: true, enum: ['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'], default: 'CASH' })
  refundMode: 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA';

  @Prop({ type: Types.ObjectId, ref: 'Customer', index: true })
  customerId?: Types.ObjectId;

  @Prop({ trim: true })
  customerName?: string;

  @Prop({ trim: true })
  customerPhone?: string;

  @Prop({ default: 'Cashier' })
  cashierName: string;

  @Prop({ trim: true })
  remarks?: string;
}

export const OrderReturnSchema = SchemaFactory.createForClass(OrderReturn);
OrderReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });
OrderReturnSchema.index({ tenantId: 1, originalInvoiceNumber: 1 });
OrderReturnSchema.index({ tenantId: 1, createdAt: -1 });
