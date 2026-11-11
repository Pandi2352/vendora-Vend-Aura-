import { Throttle } from '@nestjs/throttler';
import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { Public } from '../../common';

@ApiTags('Onboarding & Tenant Provisioning')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Get available SaaS subscription pricing plans' })
  getPlans() {
    return {
      data: this.onboardingService.getPlans(),
    };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit email OTP for tenant registration' })
  @ApiResponse({ status: 200, description: 'OTP dispatched to email' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    const data = await this.onboardingService.requestOtp(dto);
    return {
      message: 'OTP dispatched successfully',
      data,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email ownership using 6-digit OTP' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const data = await this.onboardingService.verifyOtp(dto);
    return {
      message: 'Email verified successfully',
      data,
    };
  }

  @Public()
  @Get('check-subdomain')
  @ApiOperation({ summary: 'Check if a preferred shop ID / subdomain is available' })
  @ApiQuery({ name: 'shopId', required: true, example: 'srimurugan' })
  async checkSubdomain(@Query('shopId') shopId: string) {
    const data = await this.onboardingService.checkSubdomain(shopId || '');
    return {
      data,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('complete-registration')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit store profile and auto-provision tenant workspace' })
  @ApiResponse({ status: 201, description: 'Tenant workspace successfully created' })
  async completeRegistration(@Body() dto: CompleteRegistrationDto) {
    const data = await this.onboardingService.completeRegistration(dto);
    return {
      message: 'Tenant workspace successfully created! Welcome credentials sent via email.',
      data,
    };
  }
}
