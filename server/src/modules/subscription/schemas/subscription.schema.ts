import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubscriptionPlanCode } from '../../../shared';
import { TenantBaseEntity } from '../../../common';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription extends TenantBaseEntity {
  @Prop({ required: true, enum: Object.values(SubscriptionPlanCode) })
  planCode: SubscriptionPlanCode;

  @Prop({
    required: true,
    enum: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
    default: 'TRIAL',
  })
  status: string;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 1 })
  maxOutlets: number;

  @Prop({ default: 1 })
  maxUsers: number;

  @Prop({ default: 1000 })
  maxBillsPerMonth: number;

  @Prop({ default: 0 })
  billsGeneratedThisMonth: number;

  @Prop({ default: true })
  isTrial: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
