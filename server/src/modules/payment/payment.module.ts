import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripePaymentProvider } from './providers/stripe.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripePaymentProvider],
  exports: [PaymentService, StripePaymentProvider],
})
export class PaymentModule {}

