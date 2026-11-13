import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectIdUtil, PaginationUtil, withId } from '../../common';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { StockLedger, StockLedgerDocument } from '../orders/schemas/stock-ledger.schema';
import { StockTransfer, StockTransferDocument } from './schemas/stock-transfer.schema';
import { CreateStockTransferDto, StockTransferQueryDto } from './dto/stock-transfer.dto';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class StockTransferService {
  constructor(
    @InjectModel(StockTransfer.name) private readonly transferModel: Model<StockTransferDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(StockLedger.name) private readonly stockLedgerModel: Model<StockLedgerDocument>,
  ) {}

  async listTransfers(tenantIdStr: string, query: StockTransferQueryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const filter: FilterQuery<StockTransferDocument> = { tenantId };

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    const [result, counts] = await Promise.all([
      PaginationUtil.paginate(this.transferModel, filter, {
        page: query.page,
        limit: query.limit || 25,
        sort: { createdAt: -1 },
      }),
      this.transferModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const summary = {
      total: 0,
      pending: 0,
      dispatched: 0,
      received: 0,
      cancelled: 0,
    };
    counts.forEach((c) => {
      summary.total += c.count;
      if (c._id === 'PENDING') summary.pending = c.count;
      if (c._id === 'DISPATCHED') summary.dispatched = c.count;
      if (c._id === 'RECEIVED') summary.received = c.count;
      if (c._id === 'CANCELLED') summary.cancelled = c.count;
    });

    return {
      items: result.data.map(withId),
      summary,
      meta: result.meta,
    };
  }

  async createTransfer(tenantIdStr: string, dto: CreateStockTransferDto, userName = 'Staff') {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    if (dto.sourceOutletId === dto.destinationOutletId) {
      throw new BadRequestException('Source and destination outlets must be different.');
    }

    const sourceId = ObjectIdUtil.toObjectId(dto.sourceOutletId, 'sourceOutlet');
    const destId = ObjectIdUtil.toObjectId(dto.destinationOutletId, 'destinationOutlet');

    const [sourceOutlet, destOutlet] = await Promise.all([
      this.outletModel.findOne({ _id: sourceId, tenantId }).lean(),
      this.outletModel.findOne({ _id: destId, tenantId }).lean(),
    ]);

    if (!sourceOutlet) throw new NotFoundException('Source outlet not found.');
    if (!destOutlet) throw new NotFoundException('Destination outlet not found.');

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const transferNumber = `STN-${dateStr}-${rand}`;

    const items: Array<{
      productId: any;
      productName: string;
      barcode: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }> = [];

    let totalQuantity = 0;
    let totalValue = 0;

    for (const line of dto.items) {
      const prodId = ObjectIdUtil.toObjectId(line.productId, 'product');
      const product = await this.productModel.findOne({ _id: prodId, tenantId }).lean();
      if (!product) throw new NotFoundException(`Product ${line.productId} not found.`);

      const qty = Math.max(1, Math.round(line.quantity));
      const unitCost = product.costPrice ?? round2(product.unitPrice * 0.75);
      const totalCost = round2(qty * unitCost);

      totalQuantity += qty;
      totalValue += totalCost;

      items.push({
        productId: prodId,
        productName: product.name,
        barcode: product.barcode,
        quantity: qty,
        unitCost,
        totalCost,
      });
    }

    const transfer = await this.transferModel.create({
      tenantId,
      transferNumber,
      sourceOutletId: sourceId,
      sourceOutletName: sourceOutlet.name,
      destinationOutletId: destId,
      destinationOutletName: destOutlet.name,
      status: 'PENDING',
      items,
      totalQuantity,
      totalValue: round2(totalValue),
      notes: dto.notes?.trim(),
      dispatchedBy: userName,
    });

    return withId(transfer.toObject());
  }

  async dispatchTransfer(tenantIdStr: string, idStr: string, userName = 'Staff') {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'stockTransfer');

    const transfer = await this.transferModel.findOne({ _id: id, tenantId });
    if (!transfer) throw new NotFoundException('Stock transfer not found.');
    if (transfer.status !== 'PENDING') {
      throw new BadRequestException(`Cannot dispatch transfer with status "${transfer.status}".`);
    }

    for (const item of transfer.items) {
      const updated = await this.productModel.findOneAndUpdate(
        { _id: item.productId, tenantId },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      await this.stockLedgerModel.create({
        tenantId,
        productId: item.productId,
        outletId: transfer.sourceOutletId,
        movementType: 'OUTWARD_TRANSFER',
        quantityDebit: item.quantity,
        quantityCredit: 0,
        balanceAfter: updated?.stock ?? 0,
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        remarks: `Dispatched to ${transfer.destinationOutletName} (STN: ${transfer.transferNumber})`,
      });
    }

    transfer.status = 'DISPATCHED';
    transfer.dispatchedAt = new Date();
    transfer.dispatchedBy = userName;
    await transfer.save();

    return withId(transfer.toObject());
  }

  async receiveTransfer(tenantIdStr: string, idStr: string, userName = 'Staff') {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'stockTransfer');

    const transfer = await this.transferModel.findOne({ _id: id, tenantId });
    if (!transfer) throw new NotFoundException('Stock transfer not found.');
    if (transfer.status !== 'DISPATCHED') {
      throw new BadRequestException(`Cannot receive transfer with status "${transfer.status}". Must be DISPATCHED.`);
    }

    for (const item of transfer.items) {
      const updated = await this.productModel.findOneAndUpdate(
        { _id: item.productId, tenantId },
        { $inc: { stock: item.quantity } },
        { new: true },
      );

      await this.stockLedgerModel.create({
        tenantId,
        productId: item.productId,
        outletId: transfer.destinationOutletId,
        movementType: 'INWARD_TRANSFER',
        quantityDebit: 0,
        quantityCredit: item.quantity,
        balanceAfter: updated?.stock ?? 0,
        referenceType: 'TRANSFER',
        referenceId: transfer.transferNumber,
        remarks: `Received from ${transfer.sourceOutletName} (STN: ${transfer.transferNumber})`,
      });
    }

    transfer.status = 'RECEIVED';
    transfer.receivedAt = new Date();
    transfer.receivedBy = userName;
    await transfer.save();

    return withId(transfer.toObject());
  }

  async cancelTransfer(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'stockTransfer');

    const transfer = await this.transferModel.findOne({ _id: id, tenantId });
    if (!transfer) throw new NotFoundException('Stock transfer not found.');
    if (transfer.status === 'RECEIVED' || transfer.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot cancel transfer that is already ${transfer.status}.`);
    }

    if (transfer.status === 'DISPATCHED') {
      // Revert stock decrement at source
      for (const item of transfer.items) {
        const updated = await this.productModel.findOneAndUpdate(
          { _id: item.productId, tenantId },
          { $inc: { stock: item.quantity } },
          { new: true },
        );

        await this.stockLedgerModel.create({
          tenantId,
          productId: item.productId,
          outletId: transfer.sourceOutletId,
          movementType: 'ADJUSTMENT',
          quantityDebit: 0,
          quantityCredit: item.quantity,
          balanceAfter: updated?.stock ?? 0,
          referenceType: 'TRANSFER',
          referenceId: transfer.transferNumber,
          remarks: `Cancelled transfer reversion (${transfer.transferNumber})`,
        });
      }
    }

    transfer.status = 'CANCELLED';
    await transfer.save();

    return withId(transfer.toObject());
  }
}

