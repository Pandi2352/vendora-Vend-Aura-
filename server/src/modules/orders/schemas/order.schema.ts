import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ required: true, index: true })
  invoiceNumber: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        barcode: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0.001 },
        unitPrice: { type: Number, required: true, min: 0 },
        taxRatePercent: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        batchNumber: { type: String, trim: true },
        expiryDate: { type: String, trim: true },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: string;
    name: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    taxRatePercent: number;
    taxAmount: number;
    total: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  cgst: number;

  @Prop({ default: 0 })
  sgst: number;

  @Prop({ default: 0 })
  roundOff: number;

  @Prop({ trim: true, uppercase: true })
  couponCode?: string;

  @Prop({ default: 0, min: 0 })
  discountTotal: number;

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  @Prop({ required: true, enum: ['CASH', 'UPI', 'CARD', 'CREDIT'], default: 'CASH' })
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

  @Prop({ type: Types.ObjectId, ref: 'Customer', index: true })
  customerId?: Types.ObjectId;

  @Prop({ trim: true })
  customerName?: string;

  @Prop({ trim: true })
  customerPhone?: string;

  @Prop({ default: 0 })
  cashTendered: number;

  @Prop({ default: 0 })
  changeDue: number;

  @Prop({ default: 'Cashier' })
  cashierName: string;

  @Prop({ default: 'COMPLETED', enum: ['COMPLETED', 'CANCELLED'] })
  status: string;

  @Prop({ default: false })
  isOfflineSync: boolean;

  @Prop({ trim: true })
  offlineRef?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
OrderSchema.index({ tenantId: 1, offlineRef: 1 }, { sparse: true });
OrderSchema.index({ tenantId: 1, createdAt: -1 });
