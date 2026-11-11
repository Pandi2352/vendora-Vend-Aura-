import { Throttle } from '@nestjs/throttler';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public, CurrentUser, AllowTemporaryPassword } from '../../common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store Staff / Cashier Login with Shop ID' })
  @ApiResponse({ status: 200, description: 'Login successful with JWT access & refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid shop ID or credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue new JWT access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto);
    return {
      message: 'Access token refreshed',
      data: result,
    };
  }

  @Post('change-password')
  @AllowTemporaryPassword()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (first login or regular update)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(userId, dto);
    return {
      message: result.message,
    };
  }

  @Get('me')
  @AllowTemporaryPassword()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile & store context' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser('userId') userId: string) {
    const profile = await this.authService.getProfile(userId);
    return {
      data: profile,
    };
  }

  @Post('logout')
  @AllowTemporaryPassword()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out: revokes the refresh token' })
  async logout(@CurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
