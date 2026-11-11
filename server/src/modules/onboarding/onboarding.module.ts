import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { RegistrationSession, RegistrationSessionSchema } from './schemas/registration-session.schema';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { OutletModule } from '../outlet/outlet.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { MailModule } from '../mail/mail.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationSession.name, schema: RegistrationSessionSchema },
    ]),
    TenantModule,
    UserModule,
    OutletModule,
    SubscriptionModule,
    MailModule,
    CatalogModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}

