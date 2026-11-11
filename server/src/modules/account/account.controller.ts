import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AuthenticatedUser, CurrentUser, TenantId } from '../../common';

@ApiTags('Store Account & Plan')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Store profile, terminal, subscription plan and usage against limits' })
  async getOverview(@TenantId() tenantId: string, @CurrentUser() user: AuthenticatedUser) {
    return { data: await this.accountService.getOverview(tenantId, user) };
  }
}
