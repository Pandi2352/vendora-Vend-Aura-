import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SaasAdminService } from './saas-admin.service';
import { SaasAdminAnalyticsService } from './saas-admin-analytics.service';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { UpdateTenantPlanDto, UpdateTenantStatusDto } from './dto/update-tenant.dto';
import { Public } from '../../common';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';

@ApiTags('SaaS Super Admin Platform Operations')
@ApiBearerAuth()
@UseGuards(PlatformAdminGuard)
@Controller('saas-admin')
export class SaasAdminController {
  constructor(
    private readonly saasAdminService: SaasAdminService,
    private readonly saasAdminAnalyticsService: SaasAdminAnalyticsService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform Super Admin Authentication (from .env)' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid platform admin credentials' })
  async login(@Body() dto: PlatformAdminLoginDto) {
    const result = await this.saasAdminService.login(dto);
    return {
      success: true,
      message: 'Platform Admin login successful',
      data: result,
    };
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get SaaS Platform Overview KPIs, plan distributions & recent stores' })
  async getOverview() {
    const data = await this.saasAdminAnalyticsService.getOverviewStats();
    return {
      success: true,
      data,
    };
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all registered tenants with optional search and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sector', required: false })
  async getTenants(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sector') sector?: string,
  ) {
    const data = await this.saasAdminService.getAllTenants({ search, status, sector });
    return {
      success: true,
      data,
    };
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get single tenant deep details including outlets and users' })
  async getTenantById(@Param('id') id: string) {
    const data = await this.saasAdminService.getTenantById(id);
    return {
      success: true,
      data,
    };
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Update tenant account status (ACTIVE, SUSPENDED, TRIAL)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    const data = await this.saasAdminService.updateTenantStatus(id, dto.status);
    return {
      success: true,
      message: 'Tenant status successfully updated',
      data,
    };
  }

  @Patch('tenants/:id/plan')
  @ApiOperation({ summary: 'Update tenant subscription plan (FREE_TRIAL, STARTER, GROWTH, BUSINESS)' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateTenantPlanDto,
  ) {
    const data = await this.saasAdminService.updateTenantPlan(id, dto.plan);
    return {
      success: true,
      message: 'Tenant subscription plan successfully updated',
      data,
    };
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get all tenant contacts, leads, and onboarding requests' })
  async getContacts() {
    const data = await this.saasAdminAnalyticsService.getAllContacts();
    return {
      success: true,
      data,
    };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get aggregate platform reports, sector metrics, and revenue estimates' })
  async getReports() {
    const data = await this.saasAdminAnalyticsService.getReportsData();
    return {
      success: true,
      data,
    };
  }
}
