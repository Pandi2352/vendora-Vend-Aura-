import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { SalesReportsService } from './sales-reports.service';
import { GstReportsService } from './gst-reports.service';
import { InventoryReportsService } from './inventory-reports.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { OrderReturn, OrderReturnSchema } from '../orders/schemas/order-return.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { Purchase, PurchaseSchema } from '../suppliers/schemas/purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderReturn.name, schema: OrderReturnSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [SalesReportsService, GstReportsService, InventoryReportsService],
  exports: [SalesReportsService, GstReportsService, InventoryReportsService],
})
export class ReportsModule {}

