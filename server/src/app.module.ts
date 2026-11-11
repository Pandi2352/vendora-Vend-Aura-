import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestIdMiddleware, validateEnv } from './common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { SaasAdminModule } from './modules/saas-admin/saas-admin.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { OutletModule } from './modules/outlet/outlet.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SequenceModule } from './modules/sequence/sequence.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    // Default: 300 requests / minute / IP. Sensitive routes tighten this with @Throttle().
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    TenantModule,
    UserModule,
    OutletModule,
    SubscriptionModule,
    MailModule,
    OnboardingModule,
    SaasAdminModule,
    AuthModule,
    CatalogModule,
    OrdersModule,
    SuppliersModule,
    CustomersModule,
    ReportsModule,
    SequenceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
