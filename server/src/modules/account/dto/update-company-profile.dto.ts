import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fax?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessRegNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() drugLicenceNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() taxType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tinNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() taxTaken?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() taxInclusive?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currencySign?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dateFormat?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timeFormat?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() billPrintFormat?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() barcodePort?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() billMessage1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() billMessage2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() displayMessage1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() displayMessage2?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() maxDiscount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxPriceChange?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() expiredTime?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() eodDate?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() roundOff?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() cashRounding?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() paymodeDiscount?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() memberModule?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowMultipleDiscount?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() themeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sidebarStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() navbarStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fontFamily?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fontSize?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() borderRadius?: string;
}

export const DEFAULT_COMPANY_PROFILE = {
  companyCode: 'CMP-01',
  locationCode: 'HQ',
  companyName: '',
  addressLine1: '',
  addressLine2: '',
  country: 'India',
  state: 'Tamil Nadu',
  city: '',
  postalCode: '',
  remarks: '',
  phone: '',
  fax: '',
  email: '',
  website: '',
  gstin: '',
  businessRegNo: '',
  drugLicenceNo: '',
  taxType: 'GST',
  taxPercent: 0,
  tinNo: '',
  taxTaken: null,
  taxInclusive: false,
  currency: 'INR',
  currencySign: '₹',
  dateFormat: 'dd-MM-yyyy',
  timeFormat: 'HH:mm',
  billPrintFormat: null,
  barcodePort: null,
  billMessage1: '',
  billMessage2: '',
  displayMessage1: '',
  displayMessage2: '',
  maxDiscount: 0,
  maxPriceChange: 0,
  maxCost: 0,
  expiredTime: null,
  eodDate: null,
  roundOff: true,
  cashRounding: 'none',
  paymodeDiscount: false,
  memberModule: false,
  allowMultipleDiscount: false,
  themeId: 'default',
  sidebarStyle: 'default',
  navbarStyle: 'default',
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'default',
  borderRadius: 'modern',
};

