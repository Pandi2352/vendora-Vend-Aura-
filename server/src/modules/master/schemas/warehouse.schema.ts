import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type WarehouseDocument = Warehouse & Document;

@Schema({ timestamps: true, collection: 'warehouses' })
export class Warehouse extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  address1?: string;

  @Prop({ trim: true })
  address2?: string;

  @Prop({ trim: true })
  address3?: string;

  @Prop({ trim: true })
  pincode?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  fax?: string;

  @Prop({ default: 0 })
  handlingPercent: number;

  @Prop({ trim: true, default: null })
  handlingBasis?: string;

  @Prop({ trim: true, default: null })
  handlingType?: string;

  @Prop({ default: true })
  active: boolean;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
WarehouseSchema.index({ tenantId: 1, code: 1 }, { unique: true });
WarehouseSchema.index({ tenantId: 1, active: 1 });
