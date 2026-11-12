import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { AuthenticatedUser, ObjectIdUtil } from '../../common';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../../shared';

export interface UsageMeter {
  used: number;
  limit: number;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  /** Store profile, current terminal/outlet, plan and usage against plan limits (Settings page). */
  async getOverview(tenantIdStr: string, user: AuthenticatedUser) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    if (!tenant) {
      throw new NotFoundException('Shop not found.');
    }

    const outletId = ObjectIdUtil.toObjectIdOrNull(user.outletIds?.[0]) ?? tenant.primaryOutletId;
    const [subscription, activeUsers, outlets, outlet] = await Promise.all([
      tenant.subscriptionId ? this.subscriptionModel.findById(tenant.subscriptionId).lean() : null,
      this.userModel.countDocuments({ tenantId, isActive: true }),
      this.outletModel.countDocuments({ tenantId, isActive: true }),
      outletId ? this.outletModel.findOne({ _id: outletId, tenantId }).lean() : null,
    ]);

    const planCode = (subscription?.planCode as SubscriptionPlanCode) ?? SubscriptionPlanCode.FREE_TRIAL;
    const plan = SUBSCRIPTION_PLANS[planCode] ?? SUBSCRIPTION_PLANS[SubscriptionPlanCode.FREE_TRIAL];

    return {
      store: {
        shopId: tenant.shopId,
        businessName: tenant.businessName,
        businessType: tenant.businessType,
        ownerName: tenant.ownerName,
        email: tenant.email,
        phone: tenant.phone,
        gstin: tenant.settings?.gstin ?? null,
        address: tenant.settings?.address ?? null,
        status: tenant.status,
        timezone: tenant.settings?.timezone,
        currency: tenant.settings?.currency,
      },
      terminal: {
        outletName: outlet?.name ?? 'Main Branch',
        outletCode: outlet?.code ?? 'OUT-01',
        isPrimaryOutlet: outlet?.isPrimary ?? true,
        username: user.username,
        role: user.role,
      },
      plan: {
        code: planCode,
        name: plan.name,
        tagline: plan.tagline,
        status: subscription?.status ?? 'TRIAL',
        isTrial: subscription?.isTrial ?? true,
        startsAt: subscription?.startsAt ?? null,
        expiresAt: subscription?.expiresAt ?? null,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        features: plan.features,
        daysRemaining: subscription?.expiresAt
          ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null,
      },
      usage: {
        users: { used: activeUsers, limit: subscription?.maxUsers ?? plan.maxUsers } as UsageMeter,
        outlets: { used: outlets, limit: subscription?.maxOutlets ?? plan.maxOutlets } as UsageMeter,
        billsThisMonth: {
          used: subscription?.billsGeneratedThisMonth ?? 0,
          limit: subscription?.maxBillsPerMonth ?? plan.maxBillsPerMonth,
        } as UsageMeter,
      },
    };
  }
}
