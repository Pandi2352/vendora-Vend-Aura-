import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { SubscriptionInvoice, SubscriptionInvoiceDocument } from './schemas/subscription-invoice.schema';
import { StripePaymentProvider } from './providers/stripe.provider';
import { CreateCheckoutSessionDto, BillingCycle } from './dto/create-checkout.dto';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode, TenantStatus } from '../../shared';
import { DateUtil, ObjectIdUtil } from '../../common';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentProvider: StripePaymentProvider,
    private readonly configService: ConfigService,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SubscriptionInvoice.name) private readonly invoiceModel: Model<SubscriptionInvoiceDocument>,
  ) {}

  getPublicConfig() {
    return {
      publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY', ''),
      enabled: Boolean(this.configService.get<string>('STRIPE_SECRET_KEY')),
    };
  }

  async createPlanCheckoutSession(tenantIdStr: string, dto: CreateCheckoutSessionDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Store tenant not found.');

    const plan = SUBSCRIPTION_PLANS[dto.planCode];
    if (!plan || dto.planCode === SubscriptionPlanCode.FREE_TRIAL) {
      throw new BadRequestException('Invalid or unpurchasable subscription plan selected.');
    }

    const isAnnual = dto.billingCycle === BillingCycle.ANNUAL;
    const priceInr = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const amountInPaise = Math.round(priceInr * 100);

    let customerId: string | undefined;
    try {
      customerId = await this.paymentProvider.createOrGetCustomer(
        tenant.email,
        tenant.businessName || tenant.ownerName,
        { tenantId: tenantId.toString(), shopId: tenant.shopId },
      );
    } catch (err: any) {
      this.logger.warn(`Could not sync Stripe customer: ${err.message}`);
    }

    const clientBaseUrl = this.configService.get<string>('CLIENT_BASE_URL', 'http://localhost:4001');
    let successUrl = dto.successUrl || `${clientBaseUrl}/settings?payment=success&tab=general`;
    if (!successUrl.includes('session_id=')) {
      const sep = successUrl.includes('?') ? '&' : '?';
      successUrl = `${successUrl}${sep}session_id={CHECKOUT_SESSION_ID}`;
    }
    const cancelUrl = dto.cancelUrl || `${clientBaseUrl}/settings?payment=cancelled&tab=general`;

    const session = await this.paymentProvider.createCheckoutSession({
      customerId,
      customerEmail: !customerId ? tenant.email : undefined,
      items: [
        {
          name: `Vendora POS — ${plan.name} Plan (${isAnnual ? 'Annual' : 'Monthly'})`,
          description: plan.tagline || `Subscription license for ${tenant.businessName}`,
          amount: amountInPaise,
          currency: 'inr',
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
      metadata: {
        tenantId: tenantId.toString(),
        shopId: tenant.shopId,
        planCode: dto.planCode,
        billingCycle: isAnnual ? 'ANNUAL' : 'MONTHLY',
      },
      mode: 'payment',
    });

    return {
      sessionId: session.sessionId,
      url: session.url,
      planCode: dto.planCode,
      amount: priceInr,
      currency: 'INR',
    };
  }

  async verifySession(sessionId: string) {
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const session = await this.paymentProvider.retrieveCheckoutSession(sessionId);
    if (session.paymentStatus !== 'paid') {
      return {
        success: false,
        paymentStatus: session.paymentStatus,
        message: 'Payment has not been completed yet.',
      };
    }

    const { tenantId, planCode, billingCycle } = session.metadata || {};
    if (tenantId && planCode) {
      await this.activatePurchasedPlan(tenantId, planCode as SubscriptionPlanCode, billingCycle === 'ANNUAL', sessionId);
      return {
        success: true,
        activated: true,
        planCode,
        tenantId,
        message: `Plan ${planCode} has been successfully activated.`,
      };
    }

    return {
      success: true,
      paid: true,
      message: 'Session is paid but missing tenant metadata.',
    };
  }

  async handleWebhook(rawBody: Buffer | string, signature: string) {
    const event = this.paymentProvider.constructWebhookEvent(rawBody, signature);
    this.logger.log(`Received Stripe Webhook event: ${event.type} (${event.id})`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data;
      const metadata = event.metadata || {};
      const { tenantId, planCode, billingCycle } = metadata;

      if (!tenantId || !planCode) {
        this.logger.warn('Checkout session missing tenantId or planCode metadata.');
        return { received: true, ignored: true };
      }

      await this.activatePurchasedPlan(tenantId, planCode as SubscriptionPlanCode, billingCycle === 'ANNUAL', session.id);
      return { received: true, activated: true, tenantId, planCode };
    }

    return { received: true, unhandledType: event.type };
  }

  private async activatePurchasedPlan(
    tenantIdStr: string,
    planCode: SubscriptionPlanCode,
    isAnnual: boolean,
    sessionId?: string,
  ) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const plan = SUBSCRIPTION_PLANS[planCode];
    if (!plan) return;

    const durationDays = isAnnual ? 365 : 30;
    const now = DateUtil.nowUtc();
    const expiresAt = DateUtil.addDays(now, durationDays);
    const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice;

    const tasks: Promise<any>[] = [
      this.subscriptionModel.updateOne(
        { tenantId },
        {
          $set: {
            planCode,
            status: 'ACTIVE',
            isTrial: false,
            startsAt: now,
            expiresAt,
            maxOutlets: plan.maxOutlets,
            maxUsers: plan.maxUsers,
            maxBillsPerMonth: plan.maxBillsPerMonth,
          },
        },
        { upsert: true },
      ),
      this.tenantModel.updateOne(
        { _id: tenantId },
        {
          $set: {
            status: TenantStatus.ACTIVE,
          },
        },
      ),
    ];

    if (sessionId) {
      tasks.push(
        this.invoiceModel.updateOne(
          { tenantId, sessionId },
          {
            $setOnInsert: {
              tenantId,
              sessionId,
              invoiceNumber: `INV-SUB-${new Date().getFullYear()}-${sessionId.slice(-6).toUpperCase()}`,
              planCode,
              billingCycle: isAnnual ? 'ANNUAL' : 'MONTHLY',
              amount,
              currency: 'INR',
              status: 'PAID',
              paymentMethod: 'STRIPE',
              paidAt: now,
            },
          },
          { upsert: true },
        ),
      );
    }

    await Promise.all(tasks);
    this.logger.log(`Successfully activated ${planCode} plan for tenant ${tenantIdStr} until ${expiresAt.toISOString()}`);
  }

  async getInvoices(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    return this.invoiceModel.find({ tenantId }).sort({ paidAt: -1 }).lean();
  }
}

