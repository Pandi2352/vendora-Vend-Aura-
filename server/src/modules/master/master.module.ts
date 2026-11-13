import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterController } from './master.controller';
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { Territory, TerritorySchema } from './schemas/territory.schema';
import { Reason, ReasonSchema } from './schemas/reason.schema';
import { ParamRecord, ParamSchema } from './schemas/param.schema';
import { Transporter, TransporterSchema } from './schemas/transporter.schema';
import { Freight, FreightSchema } from './schemas/freight.schema';
import { BarcodeTemplate, BarcodeTemplateSchema } from './schemas/barcode-template.schema';
import { Picker, PickerSchema } from './schemas/picker.schema';
import { Voucher, VoucherSchema } from './schemas/voucher.schema';
import { WarehouseService } from './services/warehouse.service';
import { TerritoryService } from './services/territory.service';
import { ReasonService } from './services/reason.service';
import { ParamService } from './services/param.service';
import { TransporterService } from './services/transporter.service';
import { FreightService } from './services/freight.service';
import { BarcodeTemplateService } from './services/barcode-template.service';
import { PickerService } from './services/picker.service';
import { VoucherService } from './services/voucher.service';
import { MasterSeedService } from './services/master-seed.service';
import { OperationsSeedService } from './services/operations-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: Territory.name, schema: TerritorySchema },
      { name: Reason.name, schema: ReasonSchema },
      { name: ParamRecord.name, schema: ParamSchema },
      { name: Transporter.name, schema: TransporterSchema },
      { name: Freight.name, schema: FreightSchema },
      { name: BarcodeTemplate.name, schema: BarcodeTemplateSchema },
      { name: Picker.name, schema: PickerSchema },
      { name: Voucher.name, schema: VoucherSchema },
    ]),
  ],
  controllers: [MasterController],
  providers: [
    WarehouseService,
    TerritoryService,
    ReasonService,
    ParamService,
    TransporterService,
    FreightService,
    BarcodeTemplateService,
    PickerService,
    VoucherService,
    MasterSeedService,
    OperationsSeedService,
  ],
  exports: [
    WarehouseService,
    TerritoryService,
    ReasonService,
    ParamService,
    TransporterService,
    FreightService,
    BarcodeTemplateService,
    PickerService,
    VoucherService,
    MasterSeedService,
    OperationsSeedService,
  ],
})
export class MasterModule {}
