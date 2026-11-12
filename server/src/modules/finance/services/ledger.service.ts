import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { JournalEntry, JournalEntryDocument } from '../schemas/journal-entry.schema';
import { SequenceService } from '../../sequence/sequence.service';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';
import { CHART_OF_ACCOUNTS } from '../constants/chart-of-accounts.constant';
import { ObjectIdUtil, NumberUtil } from '../../../common';

@Injectable()
export class LedgerService {
  constructor(
    @InjectModel(JournalEntry.name) private readonly journalModel: Model<JournalEntryDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  async createEntry(
    tenantIdStr: string,
    dto: CreateJournalEntryDto,
    referenceType: 'EXPENSE' | 'SALE' | 'PURCHASE' | 'MANUAL' = 'MANUAL',
    referenceId = '',
    session?: ClientSession,
  ) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const outletId = ObjectIdUtil.toObjectId(dto.outletId, 'outlet');

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of dto.lines) {
      totalDebit = NumberUtil.round(totalDebit + (line.debit || 0), 2);
      totalCredit = NumberUtil.round(totalCredit + (line.credit || 0), 2);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal entry is unbalanced. Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`,
      );
    }

    const entryNumber = await this.sequenceService.next({
      tenantId,
      prefix: 'JRN',
      session,
      findExistingMax: async (prefix) => {
        const last = await this.journalModel
          .findOne({ tenantId, entryNumber: new RegExp(`^${prefix}`) })
          .sort({ entryNumber: -1 })
          .session(session || null)
          .lean();
        return last ? parseInt(last.entryNumber.replace(prefix, ''), 10) || 0 : 0;
      },
    });

    const [doc] = await this.journalModel.create(
      [
        {
          tenantId,
          outletId,
          entryNumber,
          entryDate: new Date(),
          referenceType,
          referenceId,
          narration: dto.narration,
          lines: dto.lines,
          totalDebit,
          totalCredit,
        },
      ],
      { session },
    );

    return doc;
  }

  async getTrialBalance(tenantIdStr: string, outletIdStr?: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const match: FilterQuery<JournalEntryDocument> = { tenantId, isDeleted: { $ne: true } };
    if (outletIdStr) match.outletId = ObjectIdUtil.toObjectId(outletIdStr, 'outlet');

    const agg = await this.journalModel.aggregate<{
      _id: string;
      accountName: string;
      totalDebit: number;
      totalCredit: number;
    }>([
      { $match: match },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.accountCode',
          accountName: { $first: '$lines.accountName' },
          totalDebit: { $sum: '$lines.debit' },
          totalCredit: { $sum: '$lines.credit' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const accountsMap = new Map(CHART_OF_ACCOUNTS.map((a) => [a.code, a]));

    const accounts = agg.map((item) => {
      const coa = accountsMap.get(item._id);
      const debit = NumberUtil.round(item.totalDebit, 2);
      const credit = NumberUtil.round(item.totalCredit, 2);
      return {
        code: item._id,
        name: coa?.name || item.accountName,
        type: coa?.type || 'UNKNOWN',
        totalDebit: debit,
        totalCredit: credit,
        netBalance: NumberUtil.round(debit - credit, 2),
      };
    });

    const totalDebit = NumberUtil.round(accounts.reduce((s, a) => s + a.totalDebit, 0), 2);
    const totalCredit = NumberUtil.round(accounts.reduce((s, a) => s + a.totalCredit, 0), 2);

    return { accounts, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }

  async getProfitAndLoss(tenantIdStr: string, outletIdStr?: string) {
    const tb = await this.getTrialBalance(tenantIdStr, outletIdStr);
    const revenueAccounts = tb.accounts.filter((a) => a.code.startsWith('4'));
    const expenseAccounts = tb.accounts.filter((a) => a.code.startsWith('5'));

    // Revenue net is Credit - Debit
    const totalRevenue = NumberUtil.round(
      revenueAccounts.reduce((sum, a) => sum + (a.totalCredit - a.totalDebit), 0),
      2,
    );

    // Expense net is Debit - Credit
    const totalExpenses = NumberUtil.round(
      expenseAccounts.reduce((sum, a) => sum + (a.totalDebit - a.totalCredit), 0),
      2,
    );

    const netProfit = NumberUtil.round(totalRevenue - totalExpenses, 2);

    return {
      revenue: { accounts: revenueAccounts, total: totalRevenue },
      expenses: { accounts: expenseAccounts, total: totalExpenses },
      netProfit,
    };
  }
}

