import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordCustomerPaymentDto {
  @ApiProperty({ example: 1200, description: 'Amount paid towards Khata balance in ₹' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'UPI', enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] })
  @IsEnum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'])
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';

  @ApiPropertyOptional({ example: 'UPI Ref: 4321908234' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ example: 'Partial clearance of weekly bill' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
