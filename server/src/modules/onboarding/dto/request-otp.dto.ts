import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlanCode } from '../../../shared';

export class RequestOtpDto {
  @ApiProperty({ example: 'owner@srimurugan.in', description: 'Store owner email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: SubscriptionPlanCode.FREE_TRIAL,
    enum: SubscriptionPlanCode,
    description: 'Chosen subscription plan',
  })
  @IsEnum(SubscriptionPlanCode, { message: 'Invalid subscription plan selected' })
  @IsNotEmpty()
  selectedPlanCode: SubscriptionPlanCode;
}

