import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, IsOptional, IsIn, IsMongoId, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const RETURN_REASONS = ['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'] as const;
export const REFUND_MODES = ['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'] as const;

/** Refund amounts are computed on the server from the original invoice. */
export class ReturnItemDto {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.001)
  quantityReturned: number;

  @ApiProperty({ enum: RETURN_REASONS, example: 'CUSTOMER_REQUEST' })
  @IsIn(RETURN_REASONS)
  reason: (typeof RETURN_REASONS)[number];

  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() taxRatePercent?: number;
  @IsOptional() @IsNumber() refundAmount?: number;
}

export class CreateReturnDto {
  @ApiProperty({ example: 'INV-2026-00012' })
  @IsNotEmpty()
  @IsString()
  originalInvoiceNumber: string;

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @ApiProperty({ enum: REFUND_MODES, default: 'CASH' })
  @IsIn(REFUND_MODES)
  refundMode: (typeof REFUND_MODES)[number];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional() @IsNumber() totalRefundAmount?: number;
  @IsOptional() @IsString() customerId?: string;
  @IsOptional() @IsString() customerName?: string;
  @IsOptional() @IsString() customerPhone?: string;
}
