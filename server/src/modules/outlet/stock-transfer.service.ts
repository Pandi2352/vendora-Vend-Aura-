import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockTransfer, StockTransferDocument } from './schemas/stock-transfer.schema';
import { Outlet, OutletDocument } from './schemas/outlet.schema';
import { SequenceService } from '../sequence/sequence.service';
import { CreateStockTransferDto } from './dto/create-transfer.dto';
import { ObjectIdUtil, DateUtil } from '../../common';

export interface StockTransferView {
  id: string;
  transferNumber: string;
  sourceOutletId: string;
  destinationOutletId: string;
  sourceOutletName: string;
  destinationOutletName: string;
  items: Array<{
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unit: string;
  }>;
  status: string;
  dispatchDate: Date;
  receivedDate?: Date;
  notes?: string;
  createdAt?: Date;
}

@Injectable()
export class StockTransferService {
  constructor(
    @InjectModel(StockTransfer.name) private readonly transferModel: Model<StockTransferDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  async createTransfer(tenantIdStr: string, userIdStr: string, dto: CreateStockTransferDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const sourceOutletId = ObjectIdUtil.toObjectId(dto.sourceOutletId, 'sourceOutlet');
    const destinationOutletId = ObjectIdUtil.toObjectId(dto.destinationOutletId, 'destinationOutlet');

    if (dto.sourceOutletId === dto.destinationOutletId) {
      throw new BadRequestException('Source and destination outlet cannot be the same.');
    }

    const [source, destination] = await Promise.all([
      this.outletModel.findOne({ _id: sourceOutletId, tenantId }),
      this.outletModel.findOne({ _id: destinationOutletId, tenantId }),
    ]);

    if (!source || !destination) {
      throw new NotFoundException('Source or destination outlet not found.');
    }

    const transferNumber = await this.sequenceService.next({
      tenantId,
      prefix: 'STN',
      findExistingMax: async (prefix) => {
        const last = await this.transferModel
          .findOne({ tenantId, transferNumber: new RegExp(`^${prefix}`) })
          .sort({ transferNumber: -1 })
          .lean();
        return last ? parseInt(last.transferNumber.replace(prefix, ''), 10) || 0 : 0;
      },
    });

    const transfer = await this.transferModel.create({
      tenantId,
      transferNumber,
      sourceOutletId,
      destinationOutletId,
      items: dto.items.map((i) => ({
        productId: ObjectIdUtil.toObjectId(i.productId, 'product'),
        productName: i.productName,
        barcode: i.barcode,
        quantity: i.quantity,
        unit: i.unit || 'pcs',
      })),
      status: 'IN_TRANSIT',
      dispatchDate: DateUtil.nowUtc(),
      notes: dto.notes || '',
      createdBy: userIdStr,
    });

    return transfer;
  }

  async listTransfers(tenantIdStr: string): Promise<StockTransferView[]> {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const [transfers, outlets] = await Promise.all([
      this.transferModel.find({ tenantId }).sort({ createdAt: -1 }).lean(),
      this.outletModel.find({ tenantId }).select('name code').lean(),
    ]);

    const outletMap = new Map(outlets.map((o) => [o._id.toString(), `${o.name} (${o.code})`]));

    return transfers.map((t) => ({
      id: t._id.toString(),
      transferNumber: t.transferNumber,
      sourceOutletId: t.sourceOutletId.toString(),
      destinationOutletId: t.destinationOutletId.toString(),
      sourceOutletName: outletMap.get(t.sourceOutletId.toString()) || 'Source Outlet',
      destinationOutletName: outletMap.get(t.destinationOutletId.toString()) || 'Destination Outlet',
      items: (t.items || []).map((i) => ({
        productId: i.productId.toString(),
        productName: i.productName,
        barcode: i.barcode,
        quantity: i.quantity,
        unit: i.unit,
      })),
      status: t.status,
      dispatchDate: t.dispatchDate,
      receivedDate: t.receivedDate,
      notes: t.notes,
      createdAt: t.createdAt,
    }));
  }

  async receiveTransfer(tenantIdStr: string, transferIdStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const transferId = ObjectIdUtil.toObjectId(transferIdStr, 'transfer');

    const transfer = await this.transferModel.findOne({ _id: transferId, tenantId });
    if (!transfer) throw new NotFoundException('Stock transfer note not found.');

    if (transfer.status === 'RECEIVED') {
      throw new BadRequestException('Transfer has already been received.');
    }

    transfer.status = 'RECEIVED';
    transfer.receivedDate = DateUtil.nowUtc();
    await transfer.save();

    return transfer;
  }
}
