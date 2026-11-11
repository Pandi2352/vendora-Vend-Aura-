import { SupplierPayment, SupplierPaymentSchema } from './schemas/supplier-payment.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { PurchaseInwardService } from './purchase-inward.service';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { StockLedger, StockLedgerSchema } from '../orders/schemas/stock-ledger.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: SupplierPayment.name, schema: SupplierPaymentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StockLedger.name, schema: StockLedgerSchema },
      { name: Outlet.name, schema: OutletSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService, PurchaseInwardService],
  exports: [SuppliersService, PurchaseInwardService],
})
export class SuppliersModule {}
