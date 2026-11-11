import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderReturnsService } from './order-returns.service';
import { CashDrawerService } from './cash-drawer.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { StockLedger, StockLedgerSchema } from './schemas/stock-ledger.schema';
import { OrderReturn, OrderReturnSchema } from './schemas/order-return.schema';
import { CashDrawerShift, CashDrawerShiftSchema } from './schemas/cash-drawer-shift.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { CustomerLedger, CustomerLedgerSchema } from '../customers/schemas/customer-ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: StockLedger.name, schema: StockLedgerSchema },
      { name: OrderReturn.name, schema: OrderReturnSchema },
      { name: CashDrawerShift.name, schema: CashDrawerShiftSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Outlet.name, schema: OutletSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerLedger.name, schema: CustomerLedgerSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderReturnsService, CashDrawerService],
  exports: [OrdersService, OrderReturnsService, CashDrawerService],
})
export class OrdersModule {}
