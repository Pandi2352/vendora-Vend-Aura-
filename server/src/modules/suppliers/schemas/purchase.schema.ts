import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true, collection: 'purchases' })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  supplierName: string;

  @Prop({ required: true, index: true })
  grnNumber: string; // e.g. GRN-2026-00001

  @Prop({ trim: true })
  supplierInvoiceNumber?: string; // Vendor's physical bill number

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        barcode: { type: String, required: true },
        quantityReceived: { type: Number, required: true, min: 1 },
        unitCostPrice: { type: Number, required: true, min: 0 },
        taxRatePercent: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    barcode: string;
    quantityReceived: number;
    unitCostPrice: number;
    taxRatePercent: number;
    taxAmount: number;
    total: number;
  }>;

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  @Prop({ required: true, enum: ['PAID', 'PARTIAL', 'UNPAID'], default: 'UNPAID' })
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  balanceDue: number;

  @Prop({ default: Date.now })
  receivedDate: Date;

  @Prop({ trim: true })
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
PurchaseSchema.index({ tenantId: 1, grnNumber: 1 }, { unique: true });
PurchaseSchema.index({ tenantId: 1, receivedDate: -1 });
