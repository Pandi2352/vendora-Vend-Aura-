import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transporter, TransporterDocument } from '../schemas/transporter.schema';
import { Freight, FreightDocument } from '../schemas/freight.schema';
import { BarcodeTemplate, BarcodeTemplateDocument } from '../schemas/barcode-template.schema';
import { Picker, PickerDocument } from '../schemas/picker.schema';
import { Voucher, VoucherDocument } from '../schemas/voucher.schema';

@Injectable()
export class OperationsSeedService {
  private readonly logger = new Logger(OperationsSeedService.name);

  constructor(
    @InjectModel(Transporter.name) private readonly transporterModel: Model<TransporterDocument>,
    @InjectModel(Freight.name) private readonly freightModel: Model<FreightDocument>,
    @InjectModel(BarcodeTemplate.name) private readonly barcodeModel: Model<BarcodeTemplateDocument>,
    @InjectModel(Picker.name) private readonly pickerModel: Model<PickerDocument>,
    @InjectModel(Voucher.name) private readonly voucherModel: Model<VoucherDocument>,
  ) {}

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

  async ensureFreight(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.freightModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.freightModel.insertMany([
      {
        tenantId,
        code: 'FRT-LOCAL',
        name: 'Standard Local City Delivery',
        rateType: 'flat',
        rate: 60,
        minAmount: 40,
        applicableOn: 'sales',
        active: true,
      },
      {
        tenantId,
        code: 'FRT-INTERCITY',
        name: 'Intercity Cargo by Weight',
        rateType: 'per-kg',
        rate: 15,
        minAmount: 150,
        applicableOn: 'all',
        active: true,
      },
      {
        tenantId,
        code: 'FRT-EXPRESS',
        name: 'Express Same-Day Dispatch',
        rateType: 'flat',
        rate: 150,
        minAmount: 100,
        applicableOn: 'sales',
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default freight rules for tenant [${tenantId.toString()}]`);
  }

  async ensureBarcodeTemplates(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.barcodeModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.barcodeModel.insertMany([
      {
        tenantId,
        code: 'LBL-50X25',
        name: 'Standard Shelf 50x25mm (2-Up)',
        paperWidthMm: 50,
        paperHeightMm: 25,
        columns: 2,
        printerType: 'thermal',
        showPrice: true,
        showBarcode: true,
        showStoreName: true,
        active: true,
      },
      {
        tenantId,
        code: 'LBL-38X25',
        name: 'Compact Jewellery & Apparel Tag 38x25mm',
        paperWidthMm: 38,
        paperHeightMm: 25,
        columns: 1,
        printerType: 'thermal',
        showPrice: true,
        showBarcode: true,
        showStoreName: false,
        active: true,
      },
      {
        tenantId,
        code: 'A4-SHEET-65',
        name: 'Laser A4 Sheet 65 Labels (38.1x21.2mm)',
        paperWidthMm: 38,
        paperHeightMm: 21,
        columns: 5,
        printerType: 'laser',
        showPrice: true,
        showBarcode: true,
        showStoreName: true,
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default barcode templates for tenant [${tenantId.toString()}]`);
  }

  async ensurePickers(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.pickerModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.pickerModel.insertMany([
      {
        tenantId,
        code: 'PKR-01',
        name: 'Karthik Sundaram',
        phone: '+91 98401 54321',
        assignedZone: 'Grocery & Staples (Aisle 1-4)',
        active: true,
      },
      {
        tenantId,
        code: 'PKR-02',
        name: 'Muthu Kumar',
        phone: '+91 98402 65432',
        assignedZone: 'FMCG & Personal Care (Aisle 5-8)',
        active: true,
      },
      {
        tenantId,
        code: 'PKR-03',
        name: 'Ravi Chandran',
        phone: '+91 98403 76543',
        assignedZone: 'Cold Storage & Beverages',
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default pickers for tenant [${tenantId.toString()}]`);
  }

  async ensureVouchers(tenantId: Types.ObjectId): Promise<void> {
    const count = await this.voucherModel.countDocuments({ tenantId, isDeleted: { $ne: true } });
    if (count > 0) return;

    await this.voucherModel.insertMany([
      {
        tenantId,
        code: 'GV-FESTIVE500',
        name: 'Festive Season Gift Voucher Rs. 500',
        voucherType: 'flat',
        value: 500,
        minBillAmount: 2500,
        validityDays: 90,
        active: true,
      },
      {
        tenantId,
        code: 'GV-WELCOME100',
        name: 'New Customer Welcome Coupon Rs. 100',
        voucherType: 'flat',
        value: 100,
        minBillAmount: 500,
        validityDays: 30,
        active: true,
      },
      {
        tenantId,
        code: 'GV-LOYALTY10',
        name: 'Privilege Member 10% Discount Coupon',
        voucherType: 'percentage',
        value: 10,
        minBillAmount: 1000,
        validityDays: 60,
        active: true,
      },
    ]);
    this.logger.log(`✓ Seeded default vouchers for tenant [${tenantId.toString()}]`);
  }
}

