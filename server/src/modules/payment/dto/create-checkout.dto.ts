import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlanCode } from '../../../shared';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: SubscriptionPlanCode, example: SubscriptionPlanCode.GROWTH })
  @IsNotEmpty()
  @IsEnum(SubscriptionPlanCode)
  planCode: SubscriptionPlanCode;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle = BillingCycle.MONTHLY;

  @ApiPropertyOptional({ example: 'http://localhost:4001?payment=success' })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({ example: 'http://localhost:4001?payment=cancel' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

