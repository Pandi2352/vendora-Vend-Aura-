import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class SyncOfflineOrdersDto {
  @ApiProperty({ type: [CreateOrderDto], description: 'Queued offline sales orders to replay on cloud' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];
}

