import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Expense, ExpenseDocument } from '../schemas/expense.schema';
import { SequenceService } from '../../sequence/sequence.service';
import { LedgerService } from './ledger.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { QueryExpensesDto } from '../dto/query-expenses.dto';
import { EXPENSE_CATEGORY_MAP } from '../constants/chart-of-accounts.constant';
import { ObjectIdUtil, PaginationUtil, NumberUtil, DateUtil } from '../../../common';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    private readonly sequenceService: SequenceService,
    private readonly ledgerService: LedgerService,
  ) {}

  async createExpense(tenantIdStr: string, userIdStr: string, dto: CreateExpenseDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const outletId = ObjectIdUtil.toObjectId(dto.outletId, 'outlet');

    const catConfig = EXPENSE_CATEGORY_MAP[dto.category.toUpperCase()];
    if (!catConfig) {
      throw new BadRequestException(`Invalid expense category "${dto.category}".`);
    }

    const paymentAccountCode = dto.paymentMode === 'CASH' ? '1010' : '1020';
    const paymentAccountName = dto.paymentMode === 'CASH' ? 'Cash on Hand (Drawer)' : 'Bank / Digital Payments';

    const expenseNumber = await this.sequenceService.next({
      tenantId,
      prefix: 'EXP',
      findExistingMax: async (prefix) => {
        const last = await this.expenseModel
          .findOne({ tenantId, expenseNumber: new RegExp(`^${prefix}`) })
          .sort({ expenseNumber: -1 })
          .lean();
        return last ? parseInt(last.expenseNumber.replace(prefix, ''), 10) || 0 : 0;
      },
    });

    const expenseDate = dto.expenseDate ? new Date(dto.expenseDate) : DateUtil.nowUtc();

    const expense = await this.expenseModel.create({
      tenantId,
      outletId,
      expenseNumber,
      category: dto.category.toUpperCase(),
      accountCode: catConfig.accountCode,
      amount: NumberUtil.round(dto.amount, 2),
      paymentMode: dto.paymentMode,
      paymentAccountCode,
      description: dto.description || '',
      vendorName: dto.vendorName || '',
      expenseDate,
      createdBy: userIdStr,
    });

    // Auto-post double-entry journal entry:
    // Debit: Expense account (e.g. 5020 Store Rent)
    // Credit: Asset account (e.g. 1010 Cash Drawer / 1020 Bank)
    await this.ledgerService.createEntry(
      tenantIdStr,
      {
        outletId: dto.outletId,
        narration: `Expense ${expenseNumber} - ${catConfig.name} (${dto.description || dto.vendorName || 'General'})`,
        lines: [
          {
            accountCode: catConfig.accountCode,
            accountName: catConfig.name,
            debit: expense.amount,
            credit: 0,
          },
          {
            accountCode: paymentAccountCode,
            accountName: paymentAccountName,
            debit: 0,
            credit: expense.amount,
          },
        ],
      },
      'EXPENSE',
      expense._id.toString(),
    );

    return expense;
  }

  async listExpenses(tenantIdStr: string, query: QueryExpensesDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const filter: FilterQuery<ExpenseDocument> = { tenantId, isDeleted: { $ne: true } };

    if (query.outletId) filter.outletId = ObjectIdUtil.toObjectId(query.outletId, 'outlet');
    if (query.category) filter.category = query.category.toUpperCase();

    if (query.startDate || query.endDate) {
      filter.expenseDate = {};
      if (query.startDate) filter.expenseDate.$gte = new Date(query.startDate);
      if (query.endDate) filter.expenseDate.$lte = new Date(query.endDate);
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.expenseModel.find(filter).sort({ expenseDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.expenseModel.countDocuments(filter),
    ]);

    const totalAmount = await this.expenseModel.aggregate<{ _id: null; total: number }>([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      items,
      meta: PaginationUtil.createMeta(total, page, limit),
      totalSpent: NumberUtil.round(totalAmount[0]?.total || 0, 2),
    };
  }

  getCategories() {
    return Object.entries(EXPENSE_CATEGORY_MAP).map(([key, val]) => ({
      key,
      accountCode: val.accountCode,
      name: val.name,
    }));
  }
}
