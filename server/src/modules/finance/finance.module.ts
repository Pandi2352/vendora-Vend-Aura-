import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { JournalEntry, JournalEntrySchema } from './schemas/journal-entry.schema';
import { ExpensesService } from './services/expenses.service';
import { LedgerService } from './services/ledger.service';
import { FinanceController } from './finance.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
    ]),
    SequenceModule,
  ],
  controllers: [FinanceController],
  providers: [ExpensesService, LedgerService],
  exports: [ExpensesService, LedgerService],
})
export class FinanceModule {}

