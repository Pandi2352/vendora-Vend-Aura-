import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentGatewayProvider,
  CreateCheckoutSessionParams,
  CheckoutSessionResult,
  RetrievedCheckoutSession,
  WebhookEventResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentGatewayProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not defined. Stripe operations will fail.');
    }
    const StripeConstructor = ((Stripe as any)?.default || Stripe) as typeof Stripe;
    this.stripe = new StripeConstructor(secretKey || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia' as any,
    });
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((it) => ({
      price_data: {
        currency: it.currency.toLowerCase(),
        unit_amount: Math.round(it.amount),
        product_data: {
          name: it.name,
          description: it.description,
        },
      },
      quantity: it.quantity,
    }));

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: params.mode || 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    };

    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail;
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  async retrieveCheckoutSession(sessionId: string): Promise<RetrievedCheckoutSession> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      status: session.status || '',
      customerEmail: session.customer_details?.email || session.customer_email || undefined,
      metadata: (session.metadata as Record<string, string>) || {},
    };
  }

  constructWebhookEvent(rawBody: Buffer | string, signature: string): WebhookEventResult {
    let event: Stripe.Event;

    if (this.webhookSecret && signature) {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } else {
      // Fallback for local debugging without webhook secret verification
      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
      event = JSON.parse(bodyStr);
    }

    const session = event.data?.object as any;
    return {
      id: event.id,
      type: event.type,
      data: event.data.object,
      metadata: session?.metadata || {},
    };
  }

  async createOrGetCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string> {
    if (!email) throw new Error('Customer email is required for Stripe customer creation.');

    const existing = await this.stripe.customers.list({ email: email.trim().toLowerCase(), limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }

    const created = await this.stripe.customers.create({
      email: email.trim().toLowerCase(),
      name,
      metadata,
    });

    return created.id;
  }
}
