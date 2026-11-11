import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RegistrationStatus, SubscriptionPlanCode, BusinessType } from '../../../shared';

export type RegistrationSessionDocument = RegistrationSession & Document;

@Schema({ timestamps: true, collection: 'registration_sessions' })
export class RegistrationSession {
  @Prop({ required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, enum: Object.values(SubscriptionPlanCode) })
  selectedPlanCode: SubscriptionPlanCode;

  @Prop()
  otpHash?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: 0 })
  otpAttempts: number;

  @Prop({
    required: true,
    enum: Object.values(RegistrationStatus),
    default: RegistrationStatus.EMAIL_PENDING,
  })
  status: RegistrationStatus;

  @Prop({
    type: {
      businessName: String,
      ownerName: String,
      phone: String,
      businessType: { type: String, enum: Object.values(BusinessType) },
      preferredShopId: String,
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' },
      },
      gstin: String,
    },
  })
  formData?: {
    businessName?: string;
    ownerName?: string;
    phone?: string;
    businessType?: BusinessType;
    preferredShopId?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    gstin?: string;
  };
}

export const RegistrationSessionSchema = SchemaFactory.createForClass(RegistrationSession);
