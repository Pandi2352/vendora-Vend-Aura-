import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { TenantStatus } from '../../shared';

@Injectable()
export class SaasAdminService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getAllTenants() {
    const tenants = await this.tenantModel.find().sort({ createdAt: -1 }).lean();

    const result = await Promise.all(
      tenants.map(async (t) => {
        const users = await this.userModel.find({ tenantId: t._id }).select('username email role').lean();
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
          plan: subscription?.planCode || 'FREE_TRIAL',
          billsCount: subscription?.billsGeneratedThisMonth || 0,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
          address: t.settings?.address,
          gstin: t.settings?.gstin,
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
}

