export function validateAccountInput(body: any): { data?: AccountInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Account name is required' }
  }

  if (!body.type || !ACCOUNT_TYPES.includes(body.type)) {
    return { error: `Account type is required. Must be one of: ${ACCOUNT_TYPES.join(', ')}` }
  }

  if (body.currency && typeof body.currency !== 'string') {
    return { error: 'Currency must be a string' }
  }

  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    return { error: 'isActive must be a boolean' }
  }

  return {
    data: {
      name: body.name.trim(),
      type: body.type,
      currency: body.currency ?? 'USD',
      isActive: body.isActive,
    },
  }
}

export function validateTransactionInput(body: any): { data?: TransactionInput; error?: string } {
  if (!body.accountId || typeof body.accountId !== 'number') {
    return { error: 'accountId is required and must be a number' }
  }

  if (!body.type || !TRANSACTION_TYPES.includes(body.type)) {
    return { error: `Transaction type is required. Must be one of: ${TRANSACTION_TYPES.join(', ')}` }
  }

  if (body.amount === undefined || typeof body.amount !== 'number' || body.amount <= 0) {
    return { error: 'Amount is required and must be a positive number' }
  }

  if (!body.date || typeof body.date !== 'string') {
    return { error: 'Date is required (YYYY-MM-DD)' }
  }

  return {
    data: {
      accountId: body.accountId,
      type: body.type,
      category: body.category ?? null,
      amount: body.amount,
      description: body.description ?? null,
      date: body.date,
    },
  }
}

export function validateMonthlySummaryInput(body: any): { data?: MonthlySummaryInput; error?: string } {
  if (!body.month || typeof body.month !== 'string') {
    return { error: 'Month is required (YYYY-MM-DD, first day of month)' }
  }

  const numericFields = ['totalIncome', 'totalExpenses', 'totalSavings'] as const
  for (const field of numericFields) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== 'number') {
      return { error: `${field} must be a number` }
    }
  }

  return {
    data: {
      month: body.month,
      totalIncome: body.totalIncome ?? null,
      totalExpenses: body.totalExpenses ?? null,
      totalSavings: body.totalSavings ?? null,
      notes: body.notes ?? null,
    },
  }
}
