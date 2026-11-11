import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends TenantBaseEntity {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ default: 'Tag' })
  icon: string;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
