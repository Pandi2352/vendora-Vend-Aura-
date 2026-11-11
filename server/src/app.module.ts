import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { SaasAdminModule } from './modules/saas-admin/saas-admin.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { OutletModule } from './modules/outlet/outlet.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/vendora'),
      }),
      inject: [ConfigService],
    }),
    TenantModule,
    UserModule,
    OutletModule,
    SubscriptionModule,
    MailModule,
    OnboardingModule,
    SaasAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
