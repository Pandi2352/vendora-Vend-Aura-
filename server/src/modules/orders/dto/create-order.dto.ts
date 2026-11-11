import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  IsMongoId,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'CREDIT'] as const;
export type OrderPaymentMode = (typeof PAYMENT_MODES)[number];

/**
 * Only productId and quantity are used. Prices, tax and totals are always
 * looked up from the catalog on the server; the remaining fields are accepted
 * for backwards compatibility and ignored.
 */
export class OrderItemDto {
  @ApiProperty({ example: '665f1c...' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() taxRatePercent?: number;
  @IsOptional() @IsNumber() taxAmount?: number;
  @IsOptional() @IsNumber() total?: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: PAYMENT_MODES, example: 'CASH' })
  @IsIn(PAYMENT_MODES)
  paymentMode: OrderPaymentMode;

  @ApiProperty({ required: false, description: 'Registered customer (required for CREDIT)' })
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @ApiProperty({ required: false, description: 'Cash received (CASH only); defaults to the bill total' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashTendered?: number;

  @IsOptional() @IsString() customerName?: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsOptional() @IsNumber() subTotal?: number;
  @IsOptional() @IsNumber() taxTotal?: number;
  @IsOptional() @IsNumber() cgst?: number;
  @IsOptional() @IsNumber() sgst?: number;
  @IsOptional() @IsNumber() grandTotal?: number;
  @IsOptional() @IsNumber() changeDue?: number;
}
