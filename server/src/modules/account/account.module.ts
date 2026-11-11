import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Outlet.name, schema: OutletSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
