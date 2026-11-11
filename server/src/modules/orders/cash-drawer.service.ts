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
import { DateUtil, NumberUtil } from '../../common';

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
  ) {}

  async openShift(
    dto: OpenShiftDto,
    authUser?: { tenantId?: string; outletIds?: string[]; fullName?: string; username?: string },
  ) {
    const rawTenantId = dto.tenantId || authUser?.tenantId;
    if (!rawTenantId || !Types.ObjectId.isValid(rawTenantId)) {
      throw new BadRequestException('Valid tenant ID is required.');
    }
    const tenantId = new Types.ObjectId(rawTenantId);

    // Check if an open shift already exists
    const activeShift = await this.shiftModel.findOne({ tenantId, status: 'OPEN' });
    if (activeShift) {
      return { success: true, isExisting: true, shift: activeShift };
    }

    // Resolve outlet
    let outletId: Types.ObjectId | null = null;
    if (dto.outletId && Types.ObjectId.isValid(dto.outletId)) {
      outletId = new Types.ObjectId(dto.outletId);
    } else {
      const tenant = await this.tenantModel.findById(tenantId);
      outletId = tenant?.primaryOutletId as Types.ObjectId;
      if (!outletId) {
        const anyOutlet = await this.outletModel.findOne({ tenantId });
        outletId = anyOutlet ? anyOutlet._id : new Types.ObjectId();
      }
    }

    const currentYear = DateUtil.nowUtc().getFullYear();
    const shiftCount = await this.shiftModel.countDocuments({ tenantId });
    const shiftSeq = String(shiftCount + 1).padStart(5, '0');
    const shiftNumber = `SHIFT-${currentYear}-${shiftSeq}`;

    const cashierName = dto.cashierName || authUser?.fullName || authUser?.username || 'Cashier';

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
    return { success: true, isExisting: false, shift };
  }

  async getCurrentShift(tenantId: string): Promise<CurrentShiftSummary | null> {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }
    const tid = new Types.ObjectId(tenantId);
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

  async closeShift(
    dto: CloseShiftDto,
    authUser?: { tenantId?: string; fullName?: string },
  ) {
    const rawTenantId = dto.tenantId || authUser?.tenantId;
    if (!rawTenantId || !Types.ObjectId.isValid(rawTenantId)) {
      throw new BadRequestException('Valid tenant ID is required.');
    }
    const tenantId = new Types.ObjectId(rawTenantId);

    const shift = await this.shiftModel.findOne({
      _id: new Types.ObjectId(dto.shiftId),
      tenantId,
      status: 'OPEN',
    });
    if (!shift) {
      throw new NotFoundException('Open shift not found with the provided ID.');
    }

    // Real-time calculation
    const liveStats = await this.getCurrentShift(rawTenantId);
    const expectedCash = liveStats?.expectedCash ?? shift.openingFloat;
    const variance = dto.actualCashCounted - expectedCash;

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
    return { success: true, shift };
  }

  async getShiftHistory(tenantId: string, limit: number = 30) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID');
    }
    return this.shiftModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ openedAt: -1 })
      .limit(limit)
      .lean();
  }
}
