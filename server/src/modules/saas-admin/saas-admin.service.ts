import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { TenantStatus, SubscriptionPlanCode, SUBSCRIPTION_PLANS } from '../../shared';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { ArrayUtil, CryptoUtil, DateUtil, ObjectIdUtil, StringUtil } from '../../common';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { PLATFORM_ADMIN_SUBJECT, PLATFORM_ADMIN_TOKEN_ROLE } from '../auth/strategies/jwt.strategy';

@Injectable()
export class SaasAdminService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: PlatformAdminLoginDto) {
    const configuredUser = this.configService.get<string>('PLATFORM_ADMIN_USERNAME')?.trim();
    const configuredPass = this.configService.get<string>('PLATFORM_ADMIN_PASSWORD');

    if (!configuredUser || !configuredPass) {
      throw new UnauthorizedException('Platform Admin credentials are not configured in environment variables.');
    }

    const inputUser = dto.username.toLowerCase().trim();
    const targetUser = configuredUser.toLowerCase().trim();
    const isUserMatch = CryptoUtil.constantTimeCompare(inputUser, targetUser);
    const isPassMatch = CryptoUtil.constantTimeCompare(dto.password, configuredPass);

    if (!isUserMatch || !isPassMatch) {
      throw new UnauthorizedException('Invalid Platform Admin username or password.');
    }

    const payload = {
      sub: PLATFORM_ADMIN_SUBJECT,
      username: configuredUser,
      role: PLATFORM_ADMIN_TOKEN_ROLE,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      admin: {
        username: configuredUser,
        name: 'Vendora Platform Admin',
        role: 'SUPER_ADMIN',
      },
    };
  }

  async getAllTenants(query: TenantQueryDto) {
    const filter: FilterQuery<TenantDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.sector) filter.businessType = query.sector;
    const regex = StringUtil.searchRegex(query.search);
    if (regex) {
      filter.$or = [{ shopId: regex }, { businessName: regex }, { ownerName: regex }, { email: regex }, { phone: regex }];
    }

    const tenants = await this.tenantModel.find(filter).sort({ createdAt: -1 }).lean();
    const tenantIds = tenants.map((t) => t._id);
    const subscriptionIds = tenants.map((t) => t.subscriptionId).filter(Boolean);

    // Three batched queries instead of three queries per tenant.
    const [users, outletCounts, subscriptions] = await Promise.all([
      this.userModel.find({ tenantId: { $in: tenantIds } }).select('tenantId username email role').lean(),
      this.outletModel.aggregate<{ _id: unknown; count: number }>([
        { $match: { tenantId: { $in: tenantIds } } },
        { $group: { _id: '$tenantId', count: { $sum: 1 } } },
      ]),
      this.subscriptionModel.find({ _id: { $in: subscriptionIds } }).lean(),
    ]);
    const usersByTenant = ArrayUtil.groupBy(users, (u) => String(u.tenantId));
    const outletsByTenant = new Map(outletCounts.map((o) => [String(o._id), o.count]));
    const subscriptionById = new Map(subscriptions.map((sub) => [String(sub._id), sub]));
    const toDate = (d?: Date) => (d ? DateUtil.toIso(d).split('T')[0] : '');

    return tenants.map((t) => {
      const subscription = t.subscriptionId ? subscriptionById.get(String(t.subscriptionId)) : undefined;
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
        trialExpiresAt: toDate(subscription?.expiresAt),
        createdAt: toDate(t.createdAt),
        address: t.settings?.address,
        gstin: t.settings?.gstin,
        outletsCount: outletsByTenant.get(String(t._id)) ?? 0,
        users: (usersByTenant[String(t._id)] ?? []).map((u) => ({ username: u.username, role: u.role, email: u.email })),
      };
    });
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantModel.findById(ObjectIdUtil.toObjectId(id, 'tenant')).lean();
    if (!tenant) throw new NotFoundException('Tenant not found');

    const [users, outlets, subscription] = await Promise.all([
      this.userModel.find({ tenantId: tenant._id }).lean(),
      this.outletModel.find({ tenantId: tenant._id }).lean(),
      tenant.subscriptionId ? this.subscriptionModel.findById(tenant.subscriptionId).lean() : null,
    ]);

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

  async updateTenantStatus(id: string, status: TenantStatus) {
    const tenant = await this.tenantModel.findByIdAndUpdate(ObjectIdUtil.toObjectId(id, 'tenant'), { $set: { status } }, { new: true });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (status === TenantStatus.SUSPENDED || status === TenantStatus.EXPIRED) {
      // Force every store session to end: refresh tokens stop working immediately.
      await this.userModel.updateMany({ tenantId: tenant._id }, { $unset: { refreshTokenHash: 1 } });
    }
    return tenant;
  }

  async updateTenantPlan(id: string, planCode: SubscriptionPlanCode) {
    const tenant = await this.tenantModel.findById(ObjectIdUtil.toObjectId(id, 'tenant'));
    if (!tenant) throw new NotFoundException('Tenant not found');

    const planDetails = SUBSCRIPTION_PLANS[planCode] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.FREE_TRIAL];

    let subscription: SubscriptionDocument | null;
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
        startsAt: DateUtil.nowUtc(),
        expiresAt: DateUtil.addDays(DateUtil.nowUtc(), 30),
        maxOutlets: planDetails.maxOutlets,
        maxUsers: planDetails.maxUsers,
        maxBillsPerMonth: planDetails.maxBillsPerMonth,
        billsGeneratedThisMonth: 0,
        isTrial: planCode === SubscriptionPlanCode.FREE_TRIAL,
      });

      await this.tenantModel.updateOne({ _id: tenant._id }, { $set: { subscriptionId: subscription._id } });
    }

    return { tenant, subscription };
  }
}
