export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface ChartOfAccountItem {
  code: string;
  name: string;
  type: AccountType;
  description: string;
}

export const CHART_OF_ACCOUNTS: ChartOfAccountItem[] = [
  // 1000 - Assets
  { code: '1010', name: 'Cash on Hand (Drawer)', type: AccountType.ASSET, description: 'Physical cash collected in POS cash drawers' },
  { code: '1020', name: 'Bank / Digital Payments', type: AccountType.ASSET, description: 'Bank accounts, UPI, and card settlements' },
  { code: '1030', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Customer khata credit balances' },
  { code: '1040', name: 'Inventory Asset', type: AccountType.ASSET, description: 'Current valuation of stock on hand' },

  // 2000 - Liabilities
  { code: '2010', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Supplier payables for purchase invoices' },
  { code: '2020', name: 'GST Payable', type: AccountType.LIABILITY, description: 'Tax collected on sales payable to government' },

  // 3000 - Equity
  { code: '3010', name: "Owner's Equity", type: AccountType.EQUITY, description: 'Capital invested by business owner' },
  { code: '3020', name: 'Retained Earnings', type: AccountType.EQUITY, description: 'Accumulated profits retained in business' },

  // 4000 - Revenue
  { code: '4010', name: 'Sales Revenue', type: AccountType.REVENUE, description: 'Gross revenue from retail POS sales' },
  { code: '4020', name: 'Other Income', type: AccountType.REVENUE, description: 'Discounts received, delivery fees, scrap' },

  // 5000 - Expenses
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: AccountType.EXPENSE, description: 'Direct inventory cost of goods sold' },
  { code: '5020', name: 'Store Rent', type: AccountType.EXPENSE, description: 'Commercial premise monthly rental' },
  { code: '5021', name: 'Utilities & Power', type: AccountType.EXPENSE, description: 'Electricity, water, and broadband bills' },
  { code: '5022', name: 'Staff Salaries & Wages', type: AccountType.EXPENSE, description: 'Cashier and floor staff compensation' },
  { code: '5023', name: 'Packaging & Supplies', type: AccountType.EXPENSE, description: 'Carry bags, thermal rolls, and labels' },
  { code: '5024', name: 'Transport & Freight', type: AccountType.EXPENSE, description: 'Inward shipping, delivery, and courier charges' },
  { code: '5025', name: 'Repairs & Maintenance', type: AccountType.EXPENSE, description: 'POS hardware, AC, and refrigeration servicing' },
  { code: '5026', name: 'Marketing & Advertising', type: AccountType.EXPENSE, description: 'Local flyers, signage, and SMS promotions' },
  { code: '5027', name: 'Software & Cloud Services', type: AccountType.EXPENSE, description: 'Vendora SaaS subscription and accounting software' },
  { code: '5028', name: 'Bank & Card Charges', type: AccountType.EXPENSE, description: 'Stripe, POS EDC machine, and bank fees' },
  { code: '5029', name: 'Miscellaneous Expenses', type: AccountType.EXPENSE, description: 'Tea, refreshments, and petty cash sundries' },
];

export const EXPENSE_CATEGORY_MAP: Record<string, { accountCode: string; name: string }> = {
  RENT: { accountCode: '5020', name: 'Store Rent' },
  UTILITIES: { accountCode: '5021', name: 'Utilities & Power' },
  SALARIES: { accountCode: '5022', name: 'Staff Salaries & Wages' },
  PACKAGING: { accountCode: '5023', name: 'Packaging & Supplies' },
  FREIGHT: { accountCode: '5024', name: 'Transport & Freight' },
  MAINTENANCE: { accountCode: '5025', name: 'Repairs & Maintenance' },
  MARKETING: { accountCode: '5026', name: 'Marketing & Advertising' },
  SOFTWARE: { accountCode: '5027', name: 'Software & Cloud Services' },
  BANK_FEES: { accountCode: '5028', name: 'Bank & Card Charges' },
  OTHER: { accountCode: '5029', name: 'Miscellaneous Expenses' },
};

