export function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    type: row.type,
    category: row.category,
    amount: parseFloat(row.amount),
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
  }
}

export function toMonthlySummary(row: MonthlySummaryRow): MonthlySummary {
  return {
    id: row.id,
    month: row.month,
    totalIncome: row.total_income !== null ? parseFloat(row.total_income) : null,
    totalExpenses: row.total_expenses !== null ? parseFloat(row.total_expenses) : null,
    totalSavings: row.total_savings !== null ? parseFloat(row.total_savings) : null,
    notes: row.notes,
    createdAt: row.created_at,
  }
}
