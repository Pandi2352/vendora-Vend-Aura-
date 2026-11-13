import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateThemeDto {
  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  themeId?: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  sidebarStyle?: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  navbarStyle?: string;

  @ApiPropertyOptional({ example: 'Plus Jakarta Sans' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  fontSize?: string;

  @ApiPropertyOptional({ example: 'modern' })
  @IsOptional()
  @IsString()
  borderRadius?: string;

  @ApiPropertyOptional({ example: 'flat' })
  @IsOptional()
  @IsString()
  surfaceStyle?: string;

  @ApiPropertyOptional({ example: 'vibrant' })
  @IsOptional()
  @IsString()
  accentIntensity?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  tableStriping?: string;
}

export interface ThemeConfig {
  themeId: string;
  sidebarStyle: string;
  navbarStyle: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  surfaceStyle?: string;
  accentIntensity?: string;
  tableStriping?: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themeId: 'default',
  sidebarStyle: 'default',
  navbarStyle: 'default',
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'default',
  borderRadius: 'modern',
  surfaceStyle: 'flat',
  accentIntensity: 'vibrant',
  tableStriping: 'false',
};

