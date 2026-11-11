import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { RegistrationSession, RegistrationSessionDocument } from '../onboarding/schemas/registration-session.schema';
import { TenantStatus, SubscriptionPlanCode, SUBSCRIPTION_PLANS, BUSINESS_TYPE_LABELS } from '../../shared';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';

@Injectable()
export class SaasAdminService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(RegistrationSession.name) private readonly sessionModel: Model<RegistrationSessionDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Platform Super Admin Authentication against .env credentials
   */
  async login(dto: PlatformAdminLoginDto) {
    const configuredUser = this.configService.get<string>('PLATFORM_ADMIN_USERNAME')?.trim();
    const configuredPass = this.configService.get<string>('PLATFORM_ADMIN_PASSWORD');

    if (!configuredUser || !configuredPass) {
      throw new UnauthorizedException('Platform Admin credentials are not configured in environment variables.');
    }

    const inputUser = dto.username.toLowerCase().trim();
    const targetUser = configuredUser.toLowerCase().trim();

    // Check if input matches configured email/username or default 'admin'
    const isUserMatch = inputUser === targetUser || inputUser === 'admin';
    const isPassMatch = dto.password === configuredPass;

    if (!isUserMatch || !isPassMatch) {
      throw new UnauthorizedException('Invalid Platform Admin username or password.');
    }

    const payload = {
      sub: 'platform-super-admin',
      username: configuredUser,
      role: 'PLATFORM_SUPER_ADMIN',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        username: configuredUser,
        name: 'Vendora Platform Admin',
        role: 'SUPER_ADMIN',
      },
    };
  }

  // 1. Overview Summary & Platform Metrics
  async getOverviewStats() {
    const tenants = await this.tenantModel.find().lean();
    const subscriptions = await this.subscriptionModel.find().lean();
    const sessions = await this.sessionModel.find().lean();

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === TenantStatus.ACTIVE).length;
    const trialTenants = tenants.filter((t) => t.status === TenantStatus.TRIAL).length;
    const suspendedTenants = tenants.filter((t) => t.status === TenantStatus.SUSPENDED).length;

    // Calculate total bills and revenue
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

    // Retail Sector breakdown
    const sectorDistribution: Record<string, number> = {};
    tenants.forEach((t) => {
      const sectorName = BUSINESS_TYPE_LABELS[t.businessType as keyof typeof BUSINESS_TYPE_LABELS] || t.businessType;
      sectorDistribution[sectorName] = (sectorDistribution[sectorName] || 0) + 1;
    });

    // Recent registered tenants
    const recentTenants = await this.tenantModel
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

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
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
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

  // 2. All Tenants List with Search & Filtering
  async getAllTenants(query?: { search?: string; status?: string; plan?: string; sector?: string }) {
    const filter: any = {};

    if (query?.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query?.sector && query.sector !== 'ALL') {
      filter.businessType = query.sector;
    }
    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { shopId: regex },
        { businessName: regex },
        { ownerName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const tenants = await this.tenantModel.find(filter).sort({ createdAt: -1 }).lean();

    const result = await Promise.all(
      tenants.map(async (t) => {
        const users = await this.userModel.find({ tenantId: t._id }).select('username email role').lean();
        const outlets = await this.outletModel.find({ tenantId: t._id }).lean();
        const subscription = t.subscriptionId
          ? await this.subscriptionModel.findById(t.subscriptionId).lean()
          : null;

        return {
          id: t._id.toString(),
          shopId: t.shopId,
          businessName: t.businessName,
          ownerName: t.ownerName,
          email: t.email,
          phone: t.phone,
          businessType: t.businessType,
          status: t.status,
          plan: subscription?.planCode || SubscriptionPlanCode.FREE_TRIAL,
          billsCount: subscription?.billsGeneratedThisMonth || 0,
          maxBills: subscription?.maxBillsPerMonth || 1000,
          trialExpiresAt: subscription?.expiresAt ? new Date(subscription.expiresAt).toISOString().split('T')[0] : '',
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
          address: t.settings?.address,
          gstin: t.settings?.gstin,
          outletsCount: outlets.length,
          users: users.map((u) => ({
            username: u.username,
            role: u.role,
            email: u.email,
          })),
        };
      }),
    );

    return result;
  }

  // 3. Single Tenant Detail View
  async getTenantById(id: string) {
    const tenant = await this.tenantModel.findById(id).lean();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const users = await this.userModel.find({ tenantId: tenant._id }).lean();
    const outlets = await this.outletModel.find({ tenantId: tenant._id }).lean();
    const subscription = tenant.subscriptionId
      ? await this.subscriptionModel.findById(tenant.subscriptionId).lean()
      : null;

    return {
      id: tenant._id.toString(),
      shopId: tenant.shopId,
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      email: tenant.email,
      phone: tenant.phone,
      businessType: tenant.businessType,
      status: tenant.status,
      settings: tenant.settings,
      subscription: subscription || null,
      outlets,
      users: users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role,
        email: u.email,
        fullName: u.fullName,
        isActive: u.isActive,
      })),
      createdAt: tenant.createdAt,
    };
  }

  // 4. Update Tenant Status
  async updateTenantStatus(id: string, status: TenantStatus) {
    const tenant = await this.tenantModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  // 5. Update Tenant Subscription Plan
  async updateTenantPlan(id: string, planCode: SubscriptionPlanCode) {
    const tenant = await this.tenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const planDetails = SUBSCRIPTION_PLANS[planCode] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.FREE_TRIAL];

    let subscription: any;
    if (tenant.subscriptionId) {
      subscription = await this.subscriptionModel.findByIdAndUpdate(
        tenant.subscriptionId,
        {
          $set: {
            planCode,
            status: planCode === SubscriptionPlanCode.FREE_TRIAL ? 'TRIAL' : 'ACTIVE',
            maxOutlets: planDetails.maxOutlets,
            maxUsers: planDetails.maxUsers,
            maxBillsPerMonth: planDetails.maxBillsPerMonth,
            isTrial: planCode === SubscriptionPlanCode.FREE_TRIAL,
          },
        },
        { new: true },
      );
    } else {
      subscription = await this.subscriptionModel.create({
        tenantId: tenant._id,
        planCode,
        status: planCode === SubscriptionPlanCode.FREE_TRIAL ? 'TRIAL' : 'ACTIVE',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxOutlets: planDetails.maxOutlets,
        maxUsers: planDetails.maxUsers,
        maxBillsPerMonth: planDetails.maxBillsPerMonth,
        billsGeneratedThisMonth: 0,
        isTrial: planCode === SubscriptionPlanCode.FREE_TRIAL,
      });

      await this.tenantModel.updateOne(
        { _id: tenant._id },
        { $set: { subscriptionId: subscription._id } },
      );
    }

    return {
      tenant,
      subscription,
    };
  }

  // 6. Contact / Leads Registry
  async getAllContacts() {
    // 1. Registered Tenant Contacts
    const tenants = await this.tenantModel.find().sort({ createdAt: -1 }).lean();

    // 2. Onboarding Sessions
    const sessions = await this.sessionModel.find().sort({ createdAt: -1 }).lean();

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
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
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
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
      }));

    return [...registeredContacts, ...sessionLeads];
  }

  // 7. Aggregate Reports & Analytics
  async getReportsData() {
    const tenants = await this.tenantModel.find().lean();
    const subscriptions = await this.subscriptionModel.find().lean();

    // Sector revenue & store counts
    const sectorStats: Record<string, { count: number; bills: number }> = {};
    for (const t of tenants) {
      const sector = t.businessType || 'OTHERS';
      if (!sectorStats[sector]) {
        sectorStats[sector] = { count: 0, bills: 0 };
      }
      sectorStats[sector].count += 1;

      const sub = subscriptions.find((s) => s.tenantId.toString() === t._id.toString());
      if (sub) {
        sectorStats[sector].bills += sub.billsGeneratedThisMonth || 0;
      }
    }

    // Plan revenue
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
