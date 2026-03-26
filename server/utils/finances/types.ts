export const ACCOUNT_TYPES = ['savings', 'credit_card'] as const
export type AccountType = typeof ACCOUNT_TYPES[number]

export const INSTITUTIONS = ['bancolombia', 'nu'] as const
export type Institution = typeof INSTITUTIONS[number]

export const TRANSACTION_TYPES = ['income', 'expense', 'payment', 'fee', 'interest', 'transfer'] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

export const STATEMENT_STATUSES = ['pending', 'processing', 'completed', 'error'] as const

export const TRANSACTION_CATEGORIES = [
  'food', 'transport', 'subscription', 'salary', 'utilities',
  'entertainment', 'health', 'shopping', 'transfer', 'fee',
  'interest', 'education', 'housing', 'other', 'uncategorized',
] as const

// DB row types (snake_case)

export interface FinanceAccountRow {
  id: number
  name: string
  type: string
  institution: string
  currency: string
  account_number_last4: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FinanceStatementRow {
  id: number
  account_id: number
  file_name: string
  file_path: string
  period_start: string | null
  period_end: string | null
  status: string
  error_message: string | null
  metadata: Record<string, any>
  run_id: number | null
  created_at: string
}

export interface FinanceTransactionRow {
  id: number
  account_id: number
  statement_id: number | null
  date: string
  raw_description: string
  description: string
  amount: string
  type: string
  category: string
  running_balance: string | null
  installment_current: number | null
  installment_total: number | null
  metadata: Record<string, any>
  content_hash: string | null
  created_at: string
}

// API types (camelCase)

export interface FinanceAccount {
  id: number
  name: string
  type: string
  institution: string
  currency: string
  accountNumberLast4: string | null
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface FinanceStatement {
  id: number
  accountId: number
  fileName: string
  filePath: string
  periodStart: string | null
  periodEnd: string | null
  status: string
  errorMessage: string | null
  metadata: Record<string, any>
  runId: number | null
  createdAt: string
}

export interface FinanceTransaction {
  id: number
  accountId: number
  statementId: number | null
  date: string
  rawDescription: string
  description: string
  amount: number
  type: string
  category: string
  runningBalance: number | null
  installmentCurrent: number | null
  installmentTotal: number | null
  metadata: Record<string, any>
  contentHash: string | null
  createdAt: string
}

// Input types

export interface FinanceAccountInput {
  name: string
  type: string
  institution: string
  currency: string
  accountNumberLast4?: string | null
  metadata?: Record<string, any>
}

export interface FinanceTransactionUpdate {
  description?: string
  type?: string
  category?: string
}
