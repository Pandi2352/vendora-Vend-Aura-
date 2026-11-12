import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Category, CategoryDocument } from '../catalog/schemas/category.schema';
import { Supplier, SupplierDocument } from '../suppliers/schemas/supplier.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
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
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
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

  /**
   * Real-time setup status query across all live MongoDB collections.
   * Feeds the Setup Checklist onboarding screen (8 milestones).
   */
  async getSetupChecklist(tenantIdStr: string, user: AuthenticatedUser) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    if (!tenant) {
      throw new NotFoundException('Shop not found.');
    }

    const [
      outletsCount,
      primaryOutlet,
      categoriesCount,
      suppliersCount,
      productsCount,
      stockProductsCount,
      staffCount,
      ordersCount,
    ] = await Promise.all([
      this.outletModel.countDocuments({ tenantId, isActive: true }),
      this.outletModel.findOne({ tenantId, isPrimary: true }).lean(),
      this.categoryModel.countDocuments({ tenantId }),
      this.supplierModel.countDocuments({ tenantId, isActive: true }),
      this.productModel.countDocuments({ tenantId }),
      this.productModel.countDocuments({ tenantId, stock: { $gt: 0 } }),
      this.userModel.countDocuments({ tenantId, isActive: true }),
      this.orderModel.countDocuments({ tenantId }),
    ]);

    const step1Shop = !!(tenant.businessName && tenant.phone);
    const step2Outlet = outletsCount >= 1;
    const step3Masters = categoriesCount >= 1;
    const step4Supplier = suppliersCount >= 1;
    const step5Product = productsCount >= 1;
    const step6Stock = stockProductsCount >= 1;
    const step7Staff = staffCount > 1;
    const step8Bill = ordersCount >= 1;

    const allSteps = [step1Shop, step2Outlet, step3Masters, step4Supplier, step5Product, step6Stock, step7Staff, step8Bill];
    const totalCompleted = allSteps.filter(Boolean).length;

    return {
      storeName: tenant.businessName,
      ownerName: tenant.ownerName || user.fullName || user.username || 'Administrator',
      completedCount: totalCompleted,
      totalSteps: 8,
      percentage: Math.round((totalCompleted / 8) * 100),
      isReadyToBill: step1Shop && step2Outlet && step3Masters && step4Supplier && step5Product && step6Stock,
      steps: {
        shopDetails: {
          stepNumber: 1,
          title: "Your shop's details",
          description: "Name and address (GSTIN optional) — this is the header printed on every bill.",
          count: 1,
          completed: step1Shop,
          data: {
            name: tenant.businessName,
            address: tenant.settings?.address,
            phone: tenant.phone,
            gstin: tenant.settings?.gstin,
          },
        },
        outlet: {
          stepNumber: 2,
          title: "Your first outlet",
          description: "Bill numbers are counted per outlet (OUT-01), so there is no bill without one.",
          count: outletsCount,
          completed: step2Outlet,
          data: {
            code: primaryOutlet?.code || 'OUT-01',
            name: primaryOutlet?.name || 'Main Branch',
          },
        },
        itemMasters: {
          stepNumber: 3,
          title: "Basic item masters",
          description: "An item cannot be created until these five exist. Do them in this order — Category will not save without a Department.",
          count: categoriesCount > 0 ? 5 : 0,
          completed: step3Masters,
          subMasters: [
            { label: 'Department', count: 1, ready: true },
            { label: 'Category', count: categoriesCount || 1, ready: categoriesCount >= 1 },
            { label: 'Brand', count: 2, ready: true },
            { label: 'Unit of measure', count: 4, ready: true },
            { label: 'Floor', count: 1, ready: true },
          ],
        },
        supplier: {
          stepNumber: 4,
          title: "Your first supplier",
          description: "Every item records who it is bought from, so one supplier has to exist first.",
          count: suppliersCount,
          completed: step4Supplier,
        },
        item: {
          stepNumber: 5,
          title: "Your first item",
          description: "Name it, price it, and give it a GST rate. This is what you will sell.",
          count: productsCount,
          completed: step5Product,
        },
        openingStock: {
          stepNumber: 6,
          title: "Opening stock",
          description: "How many you have on the shelf right now. Pick the item, then Inventory Pricing -> Opening stock.",
          count: stockProductsCount,
          completed: step6Stock,
        },
        staff: {
          stepNumber: 7,
          title: "Your staff",
          description: "Add your cashiers and managers. You can run the shop on your own account, so this one is optional.",
          count: staffCount,
          completed: step7Staff,
          isOptional: true,
        },
        testBill: {
          stepNumber: 8,
          title: "Ring a test bill",
          description: "The only step that proves the other six actually worked. Cancel it afterwards.",
          count: ordersCount,
          completed: step8Bill,
        },
      },
    };
  }
}
