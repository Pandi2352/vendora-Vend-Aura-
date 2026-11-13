import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { NumberUtil, ObjectIdUtil, PaginationUtil, withId } from '../../common';
import { Product, ProductDocument } from './schemas/product.schema';
import { StockWastage, StockWastageDocument } from './schemas/stock-wastage.schema';
import { StockAudit, StockAuditDocument } from './schemas/stock-audit.schema';
import { StockLedger, StockLedgerDocument } from '../orders/schemas/stock-ledger.schema';
import { CreateWastageDto, ReconcileAuditDto, StockLedgerQueryDto } from './dto/stock-control.dto';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class InventoryStockControlService {
  private readonly logger = new Logger(InventoryStockControlService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockWastage.name) private readonly wastageModel: Model<StockWastageDocument>,
    @InjectModel(StockAudit.name) private readonly auditModel: Model<StockAuditDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
  ) {}

  /** Paginated stock movement ledger with filters */
  async getMovementLedger(tenantIdStr: string, query: StockLedgerQueryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const filter: FilterQuery<StockLedgerDocument> = { tenantId };

    if (query.movementType && query.movementType !== 'ALL') {
      filter.movementType = query.movementType;
    }
    if (query.productId) {
      filter.productId = ObjectIdUtil.toObjectId(query.productId, 'product');
    }
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const result = await PaginationUtil.paginate(this.stockLedgerModel, filter, {
      page: query.page,
      limit: query.limit || 50,
      sort: { createdAt: -1 },
      populate: { path: 'productId', select: 'name barcode category costPrice unit' },
    });

    return {
      ...result,
      data: result.data.map(withId),
    };
  }

  /** Record spoiled, damaged, or expired stock and write it off */
  async logWastage(tenantIdStr: string, dto: CreateWastageDto, reportedBy = 'Staff') {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const productId = ObjectIdUtil.toObjectId(dto.productId, 'product');

    const product = await this.productModel.findOne({ _id: productId, tenantId }).lean();
    if (!product) throw new NotFoundException('Product not found.');

    const qty = NumberUtil.round(dto.quantity);
    if (qty <= 0) throw new BadRequestException('Quantity must be greater than zero.');

    const unitCost = product.costPrice || NumberUtil.round(product.unitPrice * 0.75);
    const totalLoss = round2(qty * unitCost);

    const updated = await this.productModel.findOneAndUpdate(
      { _id: productId, tenantId },
      { $inc: { stock: -qty } },
      { new: true },
    );

    const wastage = await this.wastageModel.create({
      tenantId,
      productId,
      productName: product.name,
      barcode: product.barcode,
      quantity: qty,
      unitCost,
      totalLoss,
      reason: dto.reason,
      remarks: dto.remarks?.trim(),
      reportedBy,
    });

    await this.stockLedgerModel.create({
      tenantId,
      productId,
      movementType: 'WASTAGE_WRITE_OFF',
      quantityDebit: qty,
      quantityCredit: 0,
      balanceAfter: updated?.stock ?? 0,
      referenceType: 'WASTAGE',
      referenceId: wastage._id.toString(),
      remarks: `Write-off: ${dto.reason} (-${qty} units)`,
    });

    return withId(wastage.toObject());
  }

  /** List recorded wastage write-offs */
  async listWastage(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const docs = await this.wastageModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
    const totalLoss = round2(docs.reduce((sum, d) => sum + (d.totalLoss || 0), 0));
    const totalQty = round2(docs.reduce((sum, d) => sum + (d.quantity || 0), 0));
    return {
      summary: { totalLoss, totalQty, count: docs.length },
      items: docs.map(withId),
    };
  }

  /** Get active catalog items formatted for audit count sheet */
  async getAuditSheet(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const products = await this.productModel
      .find({ tenantId, isActive: true, isDeleted: { $ne: true } })
      .sort({ category: 1, name: 1 })
      .lean();

    return products.map((p) => ({
      productId: p._id.toString(),
      name: p.name,
      barcode: p.barcode,
      category: p.category || 'General',
      systemStock: p.stock ?? 0,
      costPrice: p.costPrice ?? round2(p.unitPrice * 0.75),
      unitPrice: p.unitPrice,
    }));
  }

  /** Reconcile physical inventory counts against system stock */
  async reconcileAudit(tenantIdStr: string, dto: ReconcileAuditDto, auditedBy = 'Store Manager') {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const auditNumber = `AUD-${dateStr}-${rand}`;

    const auditItems: Array<{
      productId: any;
      productName: string;
      barcode: string;
      category: string;
      systemStock: number;
      physicalCount: number;
      varianceQty: number;
      unitCost: number;
      varianceValue: number;
    }> = [];

    let totalVarianceQty = 0;
    let totalVarianceValue = 0;

    for (const item of dto.items) {
      const prodId = ObjectIdUtil.toObjectId(item.productId, 'product');
      const product = await this.productModel.findOne({ _id: prodId, tenantId }).lean();
      if (!product) continue;

      const systemStock = product.stock ?? 0;
      const physicalCount = Math.max(0, item.physicalCount);
      const varianceQty = physicalCount - systemStock;
      const unitCost = product.costPrice ?? round2(product.unitPrice * 0.75);
      const varianceValue = round2(varianceQty * unitCost);

      totalVarianceQty += varianceQty;
      totalVarianceValue += varianceValue;

      auditItems.push({
        productId: prodId,
        productName: product.name,
        barcode: product.barcode,
        category: product.category || '',
        systemStock,
        physicalCount,
        varianceQty,
        unitCost,
        varianceValue,
      });

      // Update product stock to match physical count
      if (varianceQty !== 0) {
        await this.productModel.updateOne({ _id: prodId, tenantId }, { $set: { stock: physicalCount } });

        await this.stockLedgerModel.create({
          tenantId,
          productId: prodId,
          movementType: 'PHYSICAL_AUDIT',
          quantityDebit: varianceQty < 0 ? Math.abs(varianceQty) : 0,
          quantityCredit: varianceQty > 0 ? varianceQty : 0,
          balanceAfter: physicalCount,
          referenceType: 'AUDIT',
          referenceId: auditNumber,
          remarks: `Physical Audit: variance ${varianceQty > 0 ? '+' : ''}${varianceQty}`,
        });
      }
    }

    const auditDoc = await this.auditModel.create({
      tenantId,
      auditNumber,
      status: 'RECONCILED',
      auditedBy,
      items: auditItems,
      totalVarianceQty: round2(totalVarianceQty),
      totalVarianceValue: round2(totalVarianceValue),
      reconciledAt: now,
      notes: dto.notes?.trim(),
    });

    return withId(auditDoc.toObject());
  }

  /** List past stock audit reconciliations */
  async listAudits(tenantIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const docs = await this.auditModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
    return docs.map(withId);
  }
}

