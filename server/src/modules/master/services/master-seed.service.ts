import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Warehouse, WarehouseDocument } from '../schemas/warehouse.schema';
import { Territory, TerritoryDocument } from '../schemas/territory.schema';
import { Reason, ReasonDocument } from '../schemas/reason.schema';
import { ParamRecord, ParamDocument } from '../schemas/param.schema';
import { Transporter, TransporterDocument } from '../schemas/transporter.schema';

@Injectable()
export class MasterSeedService {
  private readonly logger = new Logger(MasterSeedService.name);

  constructor(
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<WarehouseDocument>,
    @InjectModel(Territory.name) private readonly territoryModel: Model<TerritoryDocument>,
    @InjectModel(Reason.name) private readonly reasonModel: Model<ReasonDocument>,
    @InjectModel(ParamRecord.name) private readonly paramModel: Model<ParamDocument>,
    @InjectModel(Transporter.name) private readonly transporterModel: Model<TransporterDocument>,
  ) {}

  async ensureWarehouses(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.warehouseModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.warehouseModel.insertMany([
      {
        tenantId,
        code: 'WH-MAIN',
        name: 'Central Godown',
        address1: 'Main Storage Campus, Bay A',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        handlingPercent: 0,
        active: true,
      },
      {
        tenantId,
        code: 'WH-RET',
        name: 'Retail Floor Godown',
        address1: 'Store Backroom, Rack 1-4',
        handlingPercent: 0,
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default warehouses for tenant [${tenantId.toString()}]`);
  }

  async ensureTerritories(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.territoryModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    const south = await this.territoryModel.create({
      tenantId,
      code: 'SZ',
      name: 'South Zone',
      isGroup: true,
      parentId: null,
      active: true,
    });

    const north = await this.territoryModel.create({
      tenantId,
      code: 'NZ',
      name: 'North Zone',
      isGroup: true,
      parentId: null,
      active: true,
    });

    await this.territoryModel.insertMany([
      {
        tenantId,
        code: 'CHN',
        name: 'Chennai Central',
        isGroup: false,
        parentId: south._id,
        active: true,
      },
      {
        tenantId,
        code: 'CBE',
        name: 'Coimbatore Hub',
        isGroup: false,
        parentId: south._id,
        active: true,
      },
      {
        tenantId,
        code: 'MDU',
        name: 'Madurai District',
        isGroup: false,
        parentId: south._id,
        active: true,
      },
      {
        tenantId,
        code: 'DEL',
        name: 'Delhi NCR',
        isGroup: false,
        parentId: north._id,
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default territories for tenant [${tenantId.toString()}]`);
  }

  async ensureReasons(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.reasonModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.reasonModel.insertMany([
      {
        tenantId,
        code: 'DMG',
        description: 'Defective or damaged item received',
        reasonFor: 'Supplier Inward / Goods Received',
        transactionType: 'damage',
        effect: 'deduction',
        active: true,
      },
      {
        tenantId,
        code: 'EXP',
        description: 'Product expired on shelf',
        reasonFor: 'Batch Expiry Audit',
        transactionType: 'damage',
        effect: 'deduction',
        active: true,
      },
      {
        tenantId,
        code: 'RET',
        description: 'Customer product return / exchange',
        reasonFor: 'Counter POS Return',
        transactionType: 'sales-return',
        effect: 'addition',
        active: true,
      },
      {
        tenantId,
        code: 'ADJ',
        description: 'Physical inventory audit variance',
        reasonFor: 'Quarterly Stock Audit',
        transactionType: 'stock-adjustment',
        effect: 'addition',
        active: true,
      },
      {
        tenantId,
        code: 'WRT',
        description: 'Incorrect supplier shipment / Purchase return',
        reasonFor: 'Vendor Debit Note',
        transactionType: 'purchase-return',
        effect: 'deduction',
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default reasons for tenant [${tenantId.toString()}]`);
  }

  async ensureParams(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.paramModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.paramModel.insertMany([
      {
        tenantId,
        module: 'billing',
        code: 'PRINT_COPIES',
        description: 'Number of printed receipt copies per transaction',
        valueType: 'number',
        value: '1',
        active: true,
      },
      {
        tenantId,
        module: 'billing',
        code: 'PRINT_HEADER',
        description: 'Print store name, address and GSTIN banner on receipt',
        valueType: 'yesno',
        value: 'YES',
        active: true,
      },
      {
        tenantId,
        module: 'billing',
        code: 'DEFAULT_PAYMODE',
        description: 'Default payment mode selected on checkout counter',
        valueType: 'text',
        value: 'CASH',
        active: true,
      },
      {
        tenantId,
        module: 'pos',
        code: 'BARCODE_BEEP',
        description: 'Play confirmation audio chime on barcode scan',
        valueType: 'yesno',
        value: 'YES',
        active: true,
      },
      {
        tenantId,
        module: 'pos',
        code: 'ALLOW_ZERO_STOCK_SALE',
        description: 'Allow billing items with zero stock on counter',
        valueType: 'yesno',
        value: 'NO',
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default parameters for tenant [${tenantId.toString()}]`);
  }

  async ensureTransporters(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.transporterModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.transporterModel.insertMany([
      {
        tenantId,
        code: 'TR-BLUEDART',
        name: 'Blue Dart Express',
        transporterId: '29AABCU9603R1ZM',
        phone: '+91 98401 23456',
        address: 'Guindy Industrial Estate, Chennai',
        active: true,
      },
      {
        tenantId,
        code: 'TR-VRL',
        name: 'VRL Logistics Ltd',
        transporterId: '29AABCV1234K1Z0',
        phone: '+91 98402 34567',
        address: 'Madhavaram Truck Terminal, Chennai',
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default transporters for tenant [${tenantId.toString()}]`);
  }

  async seedAllDefaults(tenantId: Types.ObjectId): Promise<void> {
    await Promise.all([
      this.ensureWarehouses(tenantId),
      this.ensureTerritories(tenantId),
      this.ensureReasons(tenantId),
      this.ensureParams(tenantId),
      this.ensureTransporters(tenantId),
    ]);
  }
}
