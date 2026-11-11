import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SaasAdminController } from './saas-admin.controller';
import { SaasAdminService } from './saas-admin.service';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { OutletModule } from '../outlet/outlet.module';
import { RegistrationSession, RegistrationSessionSchema } from '../onboarding/schemas/registration-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationSession.name, schema: RegistrationSessionSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TenantModule,
    UserModule,
    SubscriptionModule,
    OutletModule,
  ],
  controllers: [SaasAdminController],
  providers: [SaasAdminService],
  exports: [SaasAdminService],
})
export class SaasAdminModule {}
