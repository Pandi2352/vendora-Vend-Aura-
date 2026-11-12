import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Outlet ID where expense was incurred', example: '65f01234abcd5678ef012345' })
  @IsMongoId()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({
    description: 'Expense category',
    example: 'RENT',
    enum: ['RENT', 'UTILITIES', 'SALARIES', 'PACKAGING', 'FREIGHT', 'MAINTENANCE', 'MARKETING', 'SOFTWARE', 'BANK_FEES', 'OTHER'],
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Expense amount in INR', example: 15000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Payment mode', example: 'BANK', enum: ['CASH', 'BANK', 'UPI', 'CARD'] })
  @IsEnum(['CASH', 'BANK', 'UPI', 'CARD'])
  paymentMode: 'CASH' | 'BANK' | 'UPI' | 'CARD';

  @ApiPropertyOptional({ description: 'Detailed description or note', example: 'Shop rent for November 2026' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Vendor, landlord or payee name', example: 'Apex Commercial Properties' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ description: 'Expense date (ISO)', example: '2026-11-12T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  expenseDate?: string;
}

