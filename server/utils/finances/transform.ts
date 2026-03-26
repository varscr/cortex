import type { FinanceAccountRow, FinanceAccount, FinanceStatementRow, FinanceStatement, FinanceTransactionRow, FinanceTransaction } from './types'

export function toFinanceAccount(row: FinanceAccountRow): FinanceAccount {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    institution: row.institution,
    currency: row.currency,
    accountNumberLast4: row.account_number_last4,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toFinanceStatement(row: FinanceStatementRow): FinanceStatement {
  return {
    id: row.id,
    accountId: row.account_id,
    fileName: row.file_name,
    filePath: row.file_path,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    errorMessage: row.error_message,
    metadata: row.metadata,
    runId: row.run_id,
    createdAt: row.created_at,
  }
}

export function toFinanceTransaction(row: FinanceTransactionRow): FinanceTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    statementId: row.statement_id,
    date: row.date,
    rawDescription: row.raw_description,
    description: row.description,
    amount: parseFloat(row.amount),
    type: row.type,
    category: row.category,
    runningBalance: row.running_balance ? parseFloat(row.running_balance) : null,
    installmentCurrent: row.installment_current,
    installmentTotal: row.installment_total,
    metadata: row.metadata,
    contentHash: row.content_hash,
    createdAt: row.created_at,
  }
}
