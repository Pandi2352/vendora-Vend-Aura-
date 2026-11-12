import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

export class JournalLineDto {
  @ApiProperty({ description: 'Chart of Account code', example: '1010' })
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty({ description: 'Account Name', example: 'Cash on Hand (Drawer)' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ description: 'Debit amount', example: 1000 })
  @IsNumber()
  @Min(0)
  debit: number;

  @ApiProperty({ description: 'Credit amount', example: 0 })
  @IsNumber()
  @Min(0)
  credit: number;
}

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Outlet ID', example: '65f01234abcd5678ef012345' })
  @IsMongoId()
  @IsNotEmpty()
  outletId: string;

  @ApiProperty({ description: 'Narration / Description of journal entry', example: 'Cash deposit into bank account' })
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiProperty({ type: [JournalLineDto], description: 'Debit and Credit lines (must balance)' })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}

