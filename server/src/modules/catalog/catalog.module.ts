import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { InventoryStockControlController } from './inventory-stock-control.controller';
import { InventoryStockControlService } from './inventory-stock-control.service';
import { StockTransferController } from './stock-transfer.controller';
import { StockTransferService } from './stock-transfer.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { StockWastage, StockWastageSchema } from './schemas/stock-wastage.schema';
import { StockAudit, StockAuditSchema } from './schemas/stock-audit.schema';
import { StockTransfer, StockTransferSchema } from './schemas/stock-transfer.schema';
import { StockLedger, StockLedgerSchema } from '../orders/schemas/stock-ledger.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: StockWastage.name, schema: StockWastageSchema },
      { name: StockAudit.name, schema: StockAuditSchema },
      { name: StockTransfer.name, schema: StockTransferSchema },
      { name: StockLedger.name, schema: StockLedgerSchema },
      { name: Outlet.name, schema: OutletSchema },
    ]),
  ],
  controllers: [CatalogController, InventoryStockControlController, StockTransferController],
  providers: [CatalogService, InventoryStockControlService, StockTransferService],
  exports: [CatalogService, InventoryStockControlService, StockTransferService],
})
export class CatalogModule {}
