export const ACCOUNT_TYPES = ['bank', 'crypto', 'ewallet'] as const
export type AccountType = typeof ACCOUNT_TYPES[number]

export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

// Database row types (snake_case, DECIMAL as string)
export interface AccountRow {
  id: number
  name: string
  type: string
  currency: string
  is_active: boolean
  created_at: string
}

export interface TransactionRow {
  id: number
  account_id: number
  type: string
  category: string | null
  amount: string
  description: string | null
  date: string
  created_at: string
}

export interface MonthlySummaryRow {
  id: number
  month: string
  total_income: string | null
  total_expenses: string | null
  total_savings: string | null
notes: string | null
  created_at: string
}

// API types (camelCase, DECIMAL as number)
export interface Account {
  id: number
  name: string
  type: string
  currency: string
  isActive: boolean
  createdAt: string
}

export interface Transaction {
  id: number
  accountId: number
  type: string
  category: string | null
  amount: number
  description: string | null
  date: string
  createdAt: string
}

export interface MonthlySummary {
  id: number
  month: string
  totalIncome: number | null
  totalExpenses: number | null
  totalSavings: number | null
  notes: string | null
  createdAt: string
}

// Input types
export interface AccountInput {
  name: string
  type: string
  currency?: string
  isActive?: boolean
}

export interface TransactionInput {
  accountId: number
  type: string
  category?: string | null
  amount: number
  description?: string | null
  date: string
}

export interface MonthlySummaryInput {
  month: string
  totalIncome?: number | null
  totalExpenses?: number | null
  totalSavings?: number | null
  notes?: string | null
}

// Stats types
export interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  transactionCount: number
  categoryBreakdown: { category: string; total: number; count: number }[]
  accountTotals: { accountId: number; accountName: string; income: number; expenses: number }[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
}
