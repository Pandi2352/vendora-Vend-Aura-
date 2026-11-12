import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { Supplier, SupplierSchema } from '../suppliers/schemas/supplier.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Outlet.name, schema: OutletSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
