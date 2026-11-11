import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { StockLedger, StockLedgerDocument } from '../orders/schemas/stock-ledger.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { DateUtil, NumberUtil } from '../../common';

@Injectable()
export class PurchaseInwardService {
  private readonly logger = new Logger(PurchaseInwardService.name);

  constructor(
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
  ) {}

  async createPurchaseInward(tenantId: string, dto: CreatePurchaseDto, outletIdHint?: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }
    const tenantObjectId = new Types.ObjectId(tenantId);

    const supplier = await this.supplierModel.findOne({
      _id: new Types.ObjectId(dto.supplierId),
      tenantId: tenantObjectId,
    });
    if (!supplier) throw new NotFoundException(`Supplier not found.`);

    // Resolve outlet
    let outletId: Types.ObjectId | null = null;
    const rawOutletId = dto.outletId || outletIdHint;
    if (rawOutletId && Types.ObjectId.isValid(rawOutletId)) {
      outletId = new Types.ObjectId(rawOutletId);
    } else {
      const primaryOutlet = await this.outletModel.findOne({ tenantId: tenantObjectId, isPrimary: true });
      outletId = primaryOutlet ? primaryOutlet._id : new Types.ObjectId();
    }

    // Generate sequential GRN: GRN-YYYY-XXXXX
    const year = DateUtil.nowUtc().getFullYear();
    const count = await this.purchaseModel.countDocuments({ tenantId: tenantObjectId });
    const grnSeq = String(count + 1).padStart(5, '0');
    const grnNumber = `GRN-${year}-${grnSeq}`;

    const amountPaid = NumberUtil.round(dto.amountPaid ?? 0, 2);
    const balanceDue = Math.max(0, NumberUtil.round(dto.grandTotal - amountPaid, 2));
    const paymentStatus = balanceDue === 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';

    // 1. Process Product Stock and Double-Entry Stock Ledger
    const processedItems: any[] = [];
    for (const item of dto.items) {
      const productIdObj = new Types.ObjectId(item.productId);
      const product = await this.productModel.findOne({ _id: productIdObj, tenantId: tenantObjectId });

      let balanceAfter = item.quantityReceived;
      if (product) {
        balanceAfter = product.stock + item.quantityReceived;
        await this.productModel.updateOne(
          { _id: product._id },
          {
            $inc: { stock: item.quantityReceived },
            $set: { costPrice: item.unitCostPrice },
          },
        );
      }

      await this.stockLedgerModel.create({
        tenantId: tenantObjectId,
        outletId,
        productId: productIdObj,
        movementType: 'INWARD_PURCHASE',
        quantityDebit: 0,
        quantityCredit: item.quantityReceived,
        balanceAfter,
        referenceType: 'GRN',
        referenceId: grnNumber,
        remarks: `Inward GRN: ${supplier.name} (Bill: ${dto.supplierInvoiceNumber || 'Direct'})`,
      });

      processedItems.push({
        productId: productIdObj,
        name: item.name,
        barcode: item.barcode,
        quantityReceived: item.quantityReceived,
        unitCostPrice: item.unitCostPrice,
        taxRatePercent: item.taxRatePercent || 0,
        taxAmount: item.taxAmount || 0,
        total: item.total,
      });
    }

    // 2. Create Purchase Record
    const purchase = await this.purchaseModel.create({
      tenantId: tenantObjectId,
      outletId,
      supplierId: supplier._id,
      supplierName: supplier.name,
      grnNumber,
      supplierInvoiceNumber: dto.supplierInvoiceNumber?.trim(),
      items: processedItems,
      subTotal: dto.subTotal,
      taxTotal: dto.taxTotal || 0,
      grandTotal: dto.grandTotal,
      paymentStatus,
      amountPaid,
      balanceDue,
      receivedDate: DateUtil.nowUtc(),
      notes: dto.notes?.trim(),
    });

    if (balanceDue > 0) {
      await this.supplierModel.updateOne({ _id: supplier._id }, { $inc: { balanceDue } });
    }

    this.logger.log(`Stock inwarded: ${grnNumber} from ${supplier.name} (Total: ₹${dto.grandTotal})`);
    return purchase;
  }

  async getPurchases(tenantId: string, supplierId?: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(tenantId)) throw new BadRequestException('Invalid Tenant ID');
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (supplierId && Types.ObjectId.isValid(supplierId)) {
      filter.supplierId = new Types.ObjectId(supplierId);
    }
    return this.purchaseModel.find(filter).sort({ receivedDate: -1 }).limit(limit).lean();
  }

  async getPurchaseById(tenantId: string, purchaseId: string) {
    if (!Types.ObjectId.isValid(purchaseId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }
    const purchase = await this.purchaseModel
      .findOne({ _id: new Types.ObjectId(purchaseId), tenantId: new Types.ObjectId(tenantId) })
      .lean();
    if (!purchase) throw new NotFoundException(`Purchase shipment not found.`);
    return purchase;
  }
}

