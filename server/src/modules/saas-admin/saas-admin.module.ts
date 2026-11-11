import { Module } from '@nestjs/common';
import { SaasAdminController } from './saas-admin.controller';
import { SaasAdminService } from './saas-admin.service';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [TenantModule, UserModule, SubscriptionModule],
  controllers: [SaasAdminController],
  providers: [SaasAdminService],
  exports: [SaasAdminService],
})
export class SaasAdminModule {}

