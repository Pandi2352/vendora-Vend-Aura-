import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Outlet, OutletSchema } from './schemas/outlet.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Outlet.name, schema: OutletSchema }])],
  exports: [MongooseModule],
})
export class OutletModule {}

