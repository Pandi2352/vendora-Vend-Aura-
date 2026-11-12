export interface ExpenseItem {
  _id: string;
  expenseNumber: string;
  category: string;
  accountCode: string;
  amount: number;
  paymentMode: 'CASH' | 'BANK' | 'UPI' | 'CARD';
  paymentAccountCode: string;
  description?: string;
  vendorName?: string;
  expenseDate: string;
  createdAt: string;
}

export interface ExpenseCategory {
  key: string;
  accountCode: string;
  name: string;
}

export interface TrialBalanceAccount {
  code: string;
  name: string;
  type: string;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}

export interface TrialBalanceData {
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface ProfitLossData {
  revenue: {
    accounts: TrialBalanceAccount[];
    total: number;
  };
  expenses: {
    accounts: TrialBalanceAccount[];
    total: number;
  };
  netProfit: number;
}

