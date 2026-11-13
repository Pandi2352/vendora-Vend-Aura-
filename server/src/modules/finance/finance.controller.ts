import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './services/expenses.service';
import { LedgerService } from './services/ledger.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { TenantId, CurrentUser } from '../../common';
import { UserRole } from '../../shared';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Finance & Accounting')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'List standard expense categories and COA mappings' })
  getCategories() {
    return this.expensesService.getCategories();
  }

  @Get('expenses')
  @ApiOperation({ summary: 'List and filter expenses with pagination' })
  listExpenses(@TenantId() tenantId: string, @Query() query: QueryExpensesDto) {
    return this.expensesService.listExpenses(tenantId, query);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Record a store expense and auto-post to General Ledger' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.CASHIER, UserRole.ACCOUNTANT)
  createExpense(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(tenantId, userId, dto);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Generate real-time Trial Balance across all ledger accounts' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.ACCOUNTANT)
  getTrialBalance(@TenantId() tenantId: string, @Query('outletId') outletId?: string) {
    return this.ledgerService.getTrialBalance(tenantId, outletId);
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Generate real-time Profit and Loss statement' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.ACCOUNTANT)
  getProfitAndLoss(@TenantId() tenantId: string, @Query('outletId') outletId?: string) {
    return this.ledgerService.getProfitAndLoss(tenantId, outletId);
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Record manual double-entry journal entry' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.ACCOUNTANT)
  createJournalEntry(@TenantId() tenantId: string, @Body() dto: CreateJournalEntryDto) {
    return this.ledgerService.createEntry(tenantId, dto, 'MANUAL');
  }
}
