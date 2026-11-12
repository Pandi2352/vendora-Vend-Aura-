import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Outlet, OutletSchema } from './schemas/outlet.schema';
import { StockTransfer, StockTransferSchema } from './schemas/stock-transfer.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { OutletService } from './outlet.service';
import { StockTransferService } from './stock-transfer.service';
import { OutletController } from './outlet.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Outlet.name, schema: OutletSchema },
      { name: StockTransfer.name, schema: StockTransferSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    SequenceModule,
  ],
  controllers: [OutletController],
  providers: [OutletService, StockTransferService],
  exports: [OutletService, StockTransferService, MongooseModule],
})
export class OutletModule {}
