import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type TerritoryDocument = Territory & Document;

@Schema({ timestamps: true, collection: 'territories' })
export class Territory extends TenantBaseEntity {
  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Territory', default: null })
  parentId?: Types.ObjectId | null;

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ default: true })
  active: boolean;
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
TerritorySchema.index({ tenantId: 1, code: 1 }, { unique: true });
TerritorySchema.index({ tenantId: 1, parentId: 1 });
