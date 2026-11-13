import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { AuthenticatedUser, CurrentUser, TenantId } from '../../common';

@ApiTags('Store Account & Plan')
@ApiBearerAuth()
@Controller(['account', 'setup'])
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Store profile, terminal, subscription plan and usage against limits' })
  async getOverview(@TenantId() tenantId: string, @CurrentUser() user: AuthenticatedUser) {
    return { data: await this.accountService.getOverview(tenantId, user) };
  }

  @Get(['setup-checklist', 'checklist'])
  @ApiOperation({ summary: 'Live onboarding checklist status across the 8 store setup milestones' })
  async getSetupChecklist(@TenantId() tenantId: string, @CurrentUser() user: AuthenticatedUser) {
    return { data: await this.accountService.getSetupChecklist(tenantId, user) };
  }

  @Get('company-profile')
  @ApiOperation({ summary: 'Detailed company and store profile configuration' })
  async getCompanyProfile(@TenantId() tenantId: string) {
    return { data: await this.accountService.getCompanyProfile(tenantId) };
  }

  @Put('company-profile')
  @Patch('company-profile')
  @ApiOperation({ summary: 'Update company and store profile configuration' })
  async updateCompanyProfile(
    @TenantId() tenantId: string,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return { data: await this.accountService.updateCompanyProfile(tenantId, dto) };
  }
}

