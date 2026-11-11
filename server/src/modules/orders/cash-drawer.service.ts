import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CashDrawerShift, CashDrawerShiftDocument } from './schemas/cash-drawer-shift.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderReturn, OrderReturnDocument } from './schemas/order-return.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { AuthenticatedUser, DateUtil, NumberUtil, ObjectIdUtil, PaginationDto, PaginationUtil } from '../../common';
import { SequenceService } from '../sequence/sequence.service';

export interface CurrentShiftSummary {
  _id?: any;
  tenantId?: any;
  outletId?: any;
  shiftNumber?: string;
  cashierName?: string;
  openedAt?: Date;
  closedAt?: Date;
  openingFloat?: number;
  expectedCash: number;
  actualCashCounted?: number;
  variance?: number;
  cashSalesTotal: number;
  upiSalesTotal: number;
  cardSalesTotal: number;
  creditSalesTotal: number;
  refundsTotal: number;
  cashRefundsTotal: number;
  billsCount: number;
  status?: string;
  notes?: string;
}

@Injectable()
export class CashDrawerService {
  private readonly logger = new Logger(CashDrawerService.name);

  constructor(
    @InjectModel(CashDrawerShift.name) private readonly shiftModel: Model<CashDrawerShiftDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderReturn.name) private readonly returnModel: Model<OrderReturnDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  async openShift(tenantIdStr: string, dto: OpenShiftDto, user: AuthenticatedUser) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');

    // Check if an open shift already exists
    const activeShift = await this.shiftModel.findOne({ tenantId, status: 'OPEN' });
    if (activeShift) {
      return { isExisting: true, shift: activeShift };
    }

    const tenant = await this.tenantModel.findById(tenantId).select('primaryOutletId settings').lean();
    let outletId: Types.ObjectId | null = null;
    const userOutlet = ObjectIdUtil.toObjectIdOrNull(user.outletIds?.[0]);
    if (userOutlet) {
      outletId = userOutlet;
    } else if (tenant?.primaryOutletId) {
      outletId = tenant.primaryOutletId as Types.ObjectId;
    } else {
      const anyOutlet = await this.outletModel.findOne({ tenantId }).select('_id').lean();
      if (!anyOutlet) throw new BadRequestException('This shop has no outlet configured.');
      outletId = anyOutlet._id as Types.ObjectId;
    }

    const shiftNumber = await this.sequenceService.next({
      tenantId,
      prefix: 'SHIFT',
      timezone: tenant?.settings?.timezone,
      findExistingMax: async (prefix) => {
        const last = await this.shiftModel
          .findOne({ tenantId, shiftNumber: { $regex: `^${prefix}` } })
          .sort({ shiftNumber: -1 })
          .select('shiftNumber')
          .lean();
        return SequenceService.parseSequence(last?.shiftNumber);
      },
    });

    const cashierName = user.fullName || user.username || 'Cashier';

    const shift = await this.shiftModel.create({
      tenantId,
      outletId,
      shiftNumber,
      cashierName,
      openedAt: DateUtil.nowUtc(),
      openingFloat: dto.openingFloat || 0,
      expectedCash: dto.openingFloat || 0,
      actualCashCounted: 0,
      variance: 0,
      cashSalesTotal: 0,
      upiSalesTotal: 0,
      cardSalesTotal: 0,
      creditSalesTotal: 0,
      refundsTotal: 0,
      billsCount: 0,
      status: 'OPEN',
      notes: dto.notes,
    });

    this.logger.log(`Opened drawer shift ${shiftNumber} with float ₹${dto.openingFloat} for ${cashierName}`);
    return { isExisting: false, shift };
  }

  async getCurrentShift(tenantId: string): Promise<CurrentShiftSummary | null> {
    const tid = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const shift = await this.shiftModel.findOne({ tenantId: tid, status: 'OPEN' }).lean();
    if (!shift) {
      return null;
    }

    // Aggregate real-time sales from openedAt till now
    const orders = await this.orderModel.find({
      tenantId: tid,
      createdAt: { $gte: shift.openedAt },
    }).lean();

    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let creditSales = 0;

    for (const o of orders) {
      if (o.paymentMode === 'CASH') cashSales += o.grandTotal;
      else if (o.paymentMode === 'UPI') upiSales += o.grandTotal;
      else if (o.paymentMode === 'CARD') cardSales += o.grandTotal;
      else if (o.paymentMode === 'CREDIT') creditSales += o.grandTotal;
    }

    // Aggregate returns and cash refunds
    const returns = await this.returnModel.find({
      tenantId: tid,
      createdAt: { $gte: shift.openedAt },
    }).lean();

    let totalRefunds = 0;
    let cashRefunds = 0;
    for (const r of returns) {
      totalRefunds += r.totalRefundAmount;
      if (r.refundMode === 'CASH') {
        cashRefunds += r.totalRefundAmount;
      }
    }

    const expectedCash = (shift.openingFloat || 0) + cashSales - cashRefunds;

    return {
      ...shift,
      cashSalesTotal: cashSales,
      upiSalesTotal: upiSales,
      cardSalesTotal: cardSales,
      creditSalesTotal: creditSales,
      refundsTotal: totalRefunds,
      cashRefundsTotal: cashRefunds,
      billsCount: orders.length,
      expectedCash,
    };
  }

  async closeShift(tenantIdStr: string, dto: CloseShiftDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');

    const shift = await this.shiftModel.findOne({
      _id: ObjectIdUtil.toObjectId(dto.shiftId, 'shift'),
      tenantId,
      status: 'OPEN',
    });
    if (!shift) {
      throw new NotFoundException('Open shift not found with the provided ID.');
    }

    // Real-time calculation
    const liveStats = await this.getCurrentShift(tenantIdStr);
    const expectedCash = liveStats?.expectedCash ?? shift.openingFloat;
    const variance = NumberUtil.round(dto.actualCashCounted - expectedCash, 2);

    shift.closedAt = DateUtil.nowUtc();
    shift.actualCashCounted = dto.actualCashCounted;
    shift.expectedCash = expectedCash;
    shift.variance = variance;
    shift.cashSalesTotal = liveStats?.cashSalesTotal ?? 0;
    shift.upiSalesTotal = liveStats?.upiSalesTotal ?? 0;
    shift.cardSalesTotal = liveStats?.cardSalesTotal ?? 0;
    shift.creditSalesTotal = liveStats?.creditSalesTotal ?? 0;
    shift.refundsTotal = liveStats?.refundsTotal ?? 0;
    shift.billsCount = liveStats?.billsCount ?? 0;
    shift.status = 'CLOSED';
    if (dto.notes) {
      shift.notes = shift.notes ? `${shift.notes}; ${dto.notes}` : dto.notes;
    }

    await shift.save();
    this.logger.log(`Shift ${shift.shiftNumber} CLOSED. Expected: ₹${expectedCash}, Actual: ₹${dto.actualCashCounted}, Variance: ₹${variance}`);
    return { shift };
  }

  async getShiftHistory(tenantId: string, query: PaginationDto) {
    return PaginationUtil.paginate(
      this.shiftModel,
      { tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant') },
      { page: query.page, limit: query.limit, sort: { openedAt: -1 } },
    );
  }
}
