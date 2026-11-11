import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { StockLedger, StockLedgerDocument } from '../orders/schemas/stock-ledger.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { DateUtil, NumberUtil, ObjectIdUtil, PaginationUtil, runInTransaction, toDocumentView } from '../../common';
import { PurchaseQueryDto } from './dto/supplier-query.dto';
import { SequenceService } from '../sequence/sequence.service';

@Injectable()
export class PurchaseInwardService {
  private readonly logger = new Logger(PurchaseInwardService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  /**
   * Records a goods receipt (GRN): stock up, cost price updated, supplier
   * payable increased. Totals are recomputed from the lines; everything is
   * written in one transaction where supported.
   */
  async createPurchaseInward(tenantId: string, dto: CreatePurchaseDto, outletIdHint?: string) {
    const tenantObjectId = ObjectIdUtil.toObjectId(tenantId, 'tenant');

    const supplier = await this.supplierModel.findOne({
      _id: ObjectIdUtil.toObjectId(dto.supplierId, 'supplier'),
      tenantId: tenantObjectId,
    });
    if (!supplier) throw new NotFoundException('Supplier not found.');

    const productIds = dto.items.map((item) => ObjectIdUtil.toObjectId(item.productId, 'product'));
    const products = await this.productModel.find({ _id: { $in: productIds }, tenantId: tenantObjectId }).lean();
    const productsById = new Map(products.map((p) => [p._id.toString(), p]));

    const lines = dto.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.name || item.productId} is not in this shop's catalog.`);
      }
      const base = item.quantityReceived * item.unitCostPrice;
      const taxRatePercent = item.taxRatePercent || 0;
      const taxAmount = NumberUtil.round((base * taxRatePercent) / 100, 2);
      return {
        productId: product._id as Types.ObjectId,
        name: product.name,
        barcode: product.barcode,
        quantityReceived: item.quantityReceived,
        unitCostPrice: item.unitCostPrice,
        taxRatePercent,
        taxAmount,
        total: NumberUtil.round(base + taxAmount, 2),
      };
    });

    const subTotal = NumberUtil.round(lines.reduce((sum, l) => sum + l.quantityReceived * l.unitCostPrice, 0), 2);
    const taxTotal = NumberUtil.round(lines.reduce((sum, l) => sum + l.taxAmount, 0), 2);
    const grandTotal = NumberUtil.round(subTotal + taxTotal, 2);
    const amountPaid = Math.min(NumberUtil.round(dto.amountPaid ?? 0, 2), grandTotal);
    const balanceDue = NumberUtil.round(grandTotal - amountPaid, 2);
    const paymentStatus = balanceDue === 0 ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';

    let outletId: Types.ObjectId;
    const hinted = ObjectIdUtil.toObjectIdOrNull(outletIdHint);
    if (hinted) {
      outletId = hinted;
    } else {
      const primaryOutlet = await this.outletModel.findOne({ tenantId: tenantObjectId, isPrimary: true }).select('_id').lean();
      if (!primaryOutlet) throw new BadRequestException('This shop has no outlet configured.');
      outletId = primaryOutlet._id as Types.ObjectId;
    }

    const purchase = await runInTransaction(this.connection, async (session) => {
      const grnNumber = await this.sequenceService.next({
        tenantId: tenantObjectId,
        prefix: 'GRN',
        session,
        findExistingMax: async (prefix) => {
          const last = await this.purchaseModel
            .findOne({ tenantId: tenantObjectId, grnNumber: { $regex: `^${prefix}` } })
            .sort({ grnNumber: -1 })
            .select('grnNumber')
            .session(session ?? null)
            .lean();
          return SequenceService.parseSequence(last?.grnNumber);
        },
      });

      for (const line of lines) {
        const updated = await this.productModel.findOneAndUpdate(
          { _id: line.productId, tenantId: tenantObjectId },
          { $inc: { stock: line.quantityReceived }, $set: { costPrice: line.unitCostPrice } },
          { new: true, session },
        );
        await this.stockLedgerModel.create(
          [
            {
              tenantId: tenantObjectId,
              outletId,
              productId: line.productId,
              movementType: 'INWARD_PURCHASE',
              quantityDebit: 0,
              quantityCredit: line.quantityReceived,
              balanceAfter: updated?.stock ?? line.quantityReceived,
              referenceType: 'GRN',
              referenceId: grnNumber,
              remarks: `Inward GRN: ${supplier.name} (Bill: ${dto.supplierInvoiceNumber || 'Direct'})`,
            },
          ],
          { session },
        );
      }

      const [created] = await this.purchaseModel.create(
        [
          {
            tenantId: tenantObjectId,
            outletId,
            supplierId: supplier._id,
            supplierName: supplier.name,
            grnNumber,
            supplierInvoiceNumber: dto.supplierInvoiceNumber?.trim(),
            items: lines,
            subTotal,
            taxTotal,
            grandTotal,
            paymentStatus,
            amountPaid,
            balanceDue,
            receivedDate: DateUtil.nowUtc(),
            notes: dto.notes?.trim(),
          },
        ],
        { session },
      );

      if (balanceDue > 0) {
        await this.supplierModel.updateOne({ _id: supplier._id }, { $inc: { balanceDue } }, { session });
      }
      return created;
    });

    this.logger.log(`Stock inwarded: ${purchase.grnNumber} from ${supplier.name} (Total: ₹${grandTotal})`);
    return toDocumentView(purchase.toObject());
  }

  async getPurchases(tenantId: string, query: PurchaseQueryDto) {
    const filter: FilterQuery<PurchaseDocument> = { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') };
    const supplierId = ObjectIdUtil.toObjectIdOrNull(query.supplierId);
    if (supplierId) filter.supplierId = supplierId;

    const result = await PaginationUtil.paginate(this.purchaseModel, filter, {
      page: query.page,
      limit: query.limit,
      sort: { receivedDate: -1 },
    });
    return { ...result, data: result.data.map(toDocumentView) };
  }

  async getPurchaseById(tenantId: string, purchaseId: string) {
    const purchase = await this.purchaseModel
      .findOne({
        _id: ObjectIdUtil.toObjectId(purchaseId, 'purchase'),
        tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'),
      })
      .lean();
    if (!purchase) throw new NotFoundException('Purchase shipment not found.');
    return toDocumentView(purchase);
  }
}
