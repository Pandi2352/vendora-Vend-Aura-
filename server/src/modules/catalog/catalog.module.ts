import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { InventoryStockControlController } from './inventory-stock-control.controller';
import { InventoryStockControlService } from './inventory-stock-control.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { StockWastage, StockWastageSchema } from './schemas/stock-wastage.schema';
import { StockAudit, StockAuditSchema } from './schemas/stock-audit.schema';
import { StockLedger, StockLedgerSchema } from '../orders/schemas/stock-ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: StockWastage.name, schema: StockWastageSchema },
      { name: StockAudit.name, schema: StockAuditSchema },
      { name: StockLedger.name, schema: StockLedgerSchema },
    ]),
  ],
  controllers: [CatalogController, InventoryStockControlController],
  providers: [CatalogService, InventoryStockControlService],
  exports: [CatalogService, InventoryStockControlService],
})
export class CatalogModule {}
