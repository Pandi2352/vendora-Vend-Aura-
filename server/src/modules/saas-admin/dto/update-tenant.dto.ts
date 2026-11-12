import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Max, Min } from 'class-validator';
import { SubscriptionPlanCode, TenantStatus } from '../../../shared';

export class UpdateTenantStatusDto {
  @ApiProperty({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  status: TenantStatus;
}

export class UpdateTenantPlanDto {
  @ApiProperty({ enum: SubscriptionPlanCode })
  @IsEnum(SubscriptionPlanCode)
  plan: SubscriptionPlanCode;
}

export class ExtendSubscriptionDto {
  @ApiProperty({ description: 'Number of days to extend subscription', example: 30, default: 30 })
  @IsNumber()
  @Min(1)
  @Max(365)
  days: number;
}
