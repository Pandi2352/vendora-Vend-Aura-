import { BusinessType } from '../enums/business-type.enum';
import { SubscriptionPlanCode } from '../enums/subscription-plan.enum';

export interface RequestEmailOtpDto {
  email: string;
  selectedPlanCode: SubscriptionPlanCode;
}

export interface VerifyEmailOtpDto {
  sessionId: string;
  otp: string;
}

export interface CompleteRegistrationDto {
  sessionId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  businessType: BusinessType;
  preferredShopId: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  gstin?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

