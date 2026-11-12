import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordSupplierPaymentDto {
  @ApiProperty({ example: 5000, description: 'Amount paid to settle supplier balance' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'UPI', enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] })
  @IsEnum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'])
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

  @ApiPropertyOptional({ example: 'UTR/IMPS Ref: 202611090123' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ example: 'Settlement for Invoice INV/2026/894' })
  @IsString()
  @IsOptional()
  notes?: string;
}

