import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../../shared';
import { TenantBaseEntity } from '../../../common';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User extends TenantBaseEntity {
  @Prop([{ type: Types.ObjectId, ref: 'Outlet' }])
  outletIds: Types.ObjectId[];

  @Prop({ required: true, trim: true, lowercase: true })
  username: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.CASHIER })
  role: UserRole;

  @Prop({ default: true })
  isTemporaryPassword: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, email: 1 });
