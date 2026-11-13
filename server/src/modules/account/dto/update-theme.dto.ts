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
}

export interface ThemeConfig {
  themeId: string;
  sidebarStyle: string;
  navbarStyle: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themeId: 'default',
  sidebarStyle: 'default',
  navbarStyle: 'default',
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'default',
  borderRadius: 'modern',
};

