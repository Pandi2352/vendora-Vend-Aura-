import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterController } from './master.controller';
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { Territory, TerritorySchema } from './schemas/territory.schema';
import { Reason, ReasonSchema } from './schemas/reason.schema';
import { ParamRecord, ParamSchema } from './schemas/param.schema';
import { Transporter, TransporterSchema } from './schemas/transporter.schema';
import { WarehouseService } from './services/warehouse.service';
import { TerritoryService } from './services/territory.service';
import { ReasonService } from './services/reason.service';
import { ParamService } from './services/param.service';
import { TransporterService } from './services/transporter.service';
import { MasterSeedService } from './services/master-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: Territory.name, schema: TerritorySchema },
      { name: Reason.name, schema: ReasonSchema },
      { name: ParamRecord.name, schema: ParamSchema },
      { name: Transporter.name, schema: TransporterSchema },
    ]),
  ],
  controllers: [MasterController],
  providers: [
    WarehouseService,
    TerritoryService,
    ReasonService,
    ParamService,
    TransporterService,
    MasterSeedService,
  ],
  exports: [
    WarehouseService,
    TerritoryService,
    ReasonService,
    ParamService,
    TransporterService,
    MasterSeedService,
  ],
})
export class MasterModule {}
