import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { RegistrationSession, RegistrationSessionDocument } from '../onboarding/schemas/registration-session.schema';
import { TenantStatus, SubscriptionPlanCode, SUBSCRIPTION_PLANS, BUSINESS_TYPE_LABELS } from '../../shared';
import { DateUtil } from '../../common';

@Injectable()
export class SaasAdminAnalyticsService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(RegistrationSession.name) private readonly sessionModel: Model<RegistrationSessionDocument>,
  ) {}

  async getOverviewStats() {
    const [tenants, subscriptions, sessions] = await Promise.all([
      this.tenantModel.find().lean(),
      this.subscriptionModel.find().lean(),
      this.sessionModel.find().lean(),
    ]);

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === TenantStatus.ACTIVE).length;
    const trialTenants = tenants.filter((t) => t.status === TenantStatus.TRIAL).length;
    const suspendedTenants = tenants.filter((t) => t.status === TenantStatus.SUSPENDED).length;

    let totalBillsGenerated = 0;
    let totalMonthlyRevenue = 0;

    const planDistribution: Record<string, number> = {
      [SubscriptionPlanCode.FREE_TRIAL]: 0,
      [SubscriptionPlanCode.STARTER]: 0,
      [SubscriptionPlanCode.GROWTH]: 0,
      [SubscriptionPlanCode.BUSINESS]: 0,
    };

    subscriptions.forEach((sub) => {
      totalBillsGenerated += sub.billsGeneratedThisMonth || 0;
      const plan = SUBSCRIPTION_PLANS[sub.planCode as SubscriptionPlanCode];
      if (plan) {
        if (sub.status === 'ACTIVE') {
          totalMonthlyRevenue += plan.monthlyPrice || 0;
        }
        planDistribution[sub.planCode] = (planDistribution[sub.planCode] || 0) + 1;
      }
    });

    const sectorDistribution: Record<string, number> = {};
    tenants.forEach((t) => {
      const sectorName = BUSINESS_TYPE_LABELS[t.businessType as keyof typeof BUSINESS_TYPE_LABELS] || t.businessType;
      sectorDistribution[sectorName] = (sectorDistribution[sectorName] || 0) + 1;
    });

    const recentTenants = await this.tenantModel.find().sort({ createdAt: -1 }).limit(6).lean();
    const formattedRecent = await Promise.all(
      recentTenants.map(async (t) => {
        const sub = t.subscriptionId ? await this.subscriptionModel.findById(t.subscriptionId).lean() : null;
        return {
          id: t._id.toString(),
          shopId: t.shopId,
          businessName: t.businessName,
          ownerName: t.ownerName,
          businessType: t.businessType,
          status: t.status,
          plan: sub?.planCode || 'FREE_TRIAL',
          createdAt: t.createdAt ? DateUtil.toIso(t.createdAt).split('T')[0] : '',
        };
      }),
    );

    return {
      metrics: {
        totalTenants,
        activeTenants,
        trialTenants,
        suspendedTenants,
        totalMonthlyRevenue,
        totalBillsGenerated,
        totalLeads: sessions.length,
      },
      planDistribution,
      sectorDistribution,
      recentTenants: formattedRecent,
    };
  }

  async getAllContacts() {
    const [tenants, sessions] = await Promise.all([
      this.tenantModel.find().sort({ createdAt: -1 }).lean(),
      this.sessionModel.find().sort({ createdAt: -1 }).lean(),
    ]);

    const registeredContacts = tenants.map((t) => ({
      id: t._id.toString(),
      source: 'REGISTERED_TENANT',
      businessName: t.businessName,
      ownerName: t.ownerName,
      email: t.email,
      phone: t.phone,
      city: t.settings?.address?.city || 'Chennai',
      businessType: t.businessType,
      shopId: t.shopId,
      status: t.status,
      createdAt: t.createdAt ? DateUtil.toIso(t.createdAt).split('T')[0] : '',
    }));

    const sessionLeads = sessions
      .filter((s) => !tenants.some((t) => t.email.toLowerCase() === s.email.toLowerCase()))
      .map((s) => ({
        id: s._id.toString(),
        source: 'ONBOARDING_INQUIRY',
        businessName: s.formData?.businessName || 'Store In Progress',
        ownerName: s.formData?.ownerName || 'Contact',
        email: s.email,
        phone: s.formData?.phone || 'Pending',
        city: s.formData?.address?.city || 'India',
        businessType: s.formData?.businessType || 'GENERAL_RETAIL',
        shopId: s.formData?.preferredShopId || 'pending',
        status: s.status,
        createdAt: s.createdAt ? DateUtil.toIso(s.createdAt).split('T')[0] : '',
      }));

    return [...registeredContacts, ...sessionLeads];
  }

  async getReportsData() {
    const [tenants, subscriptions] = await Promise.all([
      this.tenantModel.find().lean(),
      this.subscriptionModel.find().lean(),
    ]);

    const sectorStats: Record<string, { count: number; bills: number }> = {};
    for (const t of tenants) {
      const sector = t.businessType || 'OTHERS';
      if (!sectorStats[sector]) sectorStats[sector] = { count: 0, bills: 0 };
      sectorStats[sector].count += 1;

      const sub = subscriptions.find((s) => s.tenantId.toString() === t._id.toString());
      if (sub) {
        sectorStats[sector].bills += sub.billsGeneratedThisMonth || 0;
      }
    }

    const planStats = Object.values(SubscriptionPlanCode).map((code) => {
      const plan = SUBSCRIPTION_PLANS[code];
      const count = subscriptions.filter((s) => s.planCode === code).length;
      return {
        code,
        name: plan.name,
        price: plan.monthlyPrice,
        tenantsCount: count,
        estimatedRevenue: count * plan.monthlyPrice,
      };
    });

    return {
      sectorStats,
      planStats,
      totalTenants: tenants.length,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'ACTIVE').length,
      trialSubscriptions: subscriptions.filter((s) => s.status === 'TRIAL').length,
    };
  }
}

