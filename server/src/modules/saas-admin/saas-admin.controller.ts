import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaasAdminService } from './saas-admin.service';
import { TenantStatus } from '../../shared';

@ApiTags('SaaS Super Admin Platform Operations')
@Controller('saas-admin')
export class SaasAdminController {
  constructor(private readonly saasAdminService: SaasAdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'List all registered tenants and their store details' })
  @ApiResponse({ status: 200, description: 'All tenants retrieved' })
  async getTenants() {
    const data = await this.saasAdminService.getAllTenants();
    return {
      success: true,
      data,
    };
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Update tenant account status (ACTIVE, SUSPENDED, TRIAL)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TenantStatus,
  ) {
    const data = await this.saasAdminService.updateTenantStatus(id, status);
    return {
      success: true,
      message: 'Tenant status successfully updated',
      data,
    };
  }
}

