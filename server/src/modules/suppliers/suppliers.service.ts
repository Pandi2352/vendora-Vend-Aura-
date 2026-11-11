import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { StockLedger, StockLedgerDocument } from '../orders/schemas/stock-ledger.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
  ) {}

  /**
   * 1. Register a new Supplier
   */
  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const supplier = await this.supplierModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: dto.name.trim(),
      contactPerson: dto.contactPerson?.trim(),
      phone: dto.phone.trim(),
      email: dto.email?.toLowerCase().trim(),
      gstin: dto.gstin?.toUpperCase().trim(),
      creditDays: dto.creditDays ?? 30,
      category: dto.category?.trim() || 'General',
      address: dto.address || {},
      balanceDue: 0,
      isActive: true,
    });

    return supplier;
  }

  /**
   * 2. List all Suppliers for a Tenant with Search
   */
  async getSuppliers(tenantId: string, search?: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { contactPerson: regex },
        { gstin: regex },
        { category: regex },
      ];
    }

    const suppliers = await this.supplierModel
      .find(filter)
      .sort({ name: 1 })
      .lean();

    return suppliers.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      gstin: s.gstin,
      creditDays: s.creditDays,
      category: s.category,
      address: s.address,
      balanceDue: s.balanceDue,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }

  /**
   * 3. Get Single Supplier Details
   */
  async getSupplierById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const supplier = await this.supplierModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!supplier) {
      throw new NotFoundException(`Supplier not found.`);
    }

    return supplier;
  }

  /**
   * 4. Update Supplier Details
   */
  async updateSupplier(tenantId: string, id: string, dto: Partial<CreateSupplierDto>) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const updated = await this.supplierModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: dto },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException(`Supplier not found.`);
    }

    return updated;
  }

  /**
   * 5. Record Purchase Inward / GRN (Goods Receipt Note):
   * - Saves Purchase record
   * - Atomically increments product stock
   * - Writes immutable StockLedger INWARD entries
   * - Updates supplier balanceDue if unpaid or partial
   */
  async createPurchaseInward(tenantId: string, dto: CreatePurchaseDto, outletIdHint?: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const tenantObjectId = new Types.ObjectId(tenantId);

    const supplier = await this.supplierModel.findOne({
      _id: new Types.ObjectId(dto.supplierId),
      tenantId: tenantObjectId,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found.`);
    }

    // Resolve outlet
    let outletId: Types.ObjectId | null = null;
    const rawOutletId = dto.outletId || outletIdHint;
    if (rawOutletId && Types.ObjectId.isValid(rawOutletId)) {
      outletId = new Types.ObjectId(rawOutletId);
    } else {
      const primaryOutlet = await this.outletModel.findOne({
        tenantId: tenantObjectId,
        isPrimary: true,
      });
      outletId = primaryOutlet ? primaryOutlet._id : new Types.ObjectId();
    }

    // Generate sequential GRN Number
    const year = new Date().getFullYear();
    const count = await this.purchaseModel.countDocuments({ tenantId: tenantObjectId });
    const grnSeq = String(count + 1).padStart(5, '0');
    const grnNumber = `GRN-${year}-${grnSeq}`;

    const amountPaid = dto.amountPaid ?? 0;
    const balanceDue = Math.max(0, dto.grandTotal - amountPaid);
    const paymentStatus =
      balanceDue === 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';

    // 1. Process Product Stock and Double-Entry Stock Ledger
    const processedItems: any[] = [];
    for (const item of dto.items) {
      const productIdObj = new Types.ObjectId(item.productId);
      const product = await this.productModel.findOne({
        _id: productIdObj,
        tenantId: tenantObjectId,
      });

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

      // Append double-entry StockLedger inward credit
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
      receivedDate: new Date(),
      notes: dto.notes?.trim(),
    });

    // 3. Update Supplier Outstanding Balance
    if (balanceDue > 0) {
      await this.supplierModel.updateOne(
        { _id: supplier._id },
        { $inc: { balanceDue } },
      );
    }

    this.logger.log(`Stock inwarded: ${grnNumber} from ${supplier.name} (Total: ₹${dto.grandTotal})`);

    return purchase;
  }

  /**
   * 6. Record Supplier Dues Repayment Settlement
   */
  async recordSupplierPayment(
    tenantId: string,
    supplierId: string,
    dto: RecordSupplierPaymentDto,
  ) {
    if (!Types.ObjectId.isValid(supplierId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const supplier = await this.supplierModel.findOne({
      _id: new Types.ObjectId(supplierId),
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found.`);
    }

    const newBalance = Math.max(0, supplier.balanceDue - dto.amount);
    await this.supplierModel.updateOne(
      { _id: supplier._id },
      { $set: { balanceDue: newBalance } },
    );

    return {
      success: true,
      supplierId: supplier._id.toString(),
      amountPaid: dto.amount,
      balanceDue: newBalance,
      referenceNumber: dto.referenceNumber,
    };
  }

  /**
   * 7. List Purchases / Inward Shipments
   */
  async getPurchases(tenantId: string, supplierId?: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (supplierId && Types.ObjectId.isValid(supplierId)) {
      filter.supplierId = new Types.ObjectId(supplierId);
    }

    const purchases = await this.purchaseModel
      .find(filter)
      .sort({ receivedDate: -1 })
      .limit(limit)
      .lean();

    return purchases.map((p) => ({
      id: p._id.toString(),
      grnNumber: p.grnNumber,
      supplierId: p.supplierId.toString(),
      supplierName: p.supplierName,
      supplierInvoiceNumber: p.supplierInvoiceNumber,
      itemsCount: p.items.length,
      items: p.items,
      subTotal: p.subTotal,
      taxTotal: p.taxTotal,
      grandTotal: p.grandTotal,
      paymentStatus: p.paymentStatus,
      amountPaid: p.amountPaid,
      balanceDue: p.balanceDue,
      receivedDate: p.receivedDate,
      notes: p.notes,
    }));
  }

  /**
   * 8. Single Purchase Details
   */
  async getPurchaseById(tenantId: string, purchaseId: string) {
    if (!Types.ObjectId.isValid(purchaseId) || !Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid ID');
    }

    const purchase = await this.purchaseModel
      .findOne({
        _id: new Types.ObjectId(purchaseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!purchase) {
      throw new NotFoundException(`Purchase shipment not found.`);
    }

    return purchase;
  }
}
