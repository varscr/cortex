import { ACCOUNT_TYPES, INSTITUTIONS, TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from './types'
import type { FinanceAccountInput, FinanceTransactionUpdate } from './types'

export function validateAccountInput(body: any): { data?: FinanceAccountInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'name is required' }
  }
  if (!body.type || !ACCOUNT_TYPES.includes(body.type)) {
    return { error: `type must be one of: ${ACCOUNT_TYPES.join(', ')}` }
  }
  if (!body.institution || !INSTITUTIONS.includes(body.institution)) {
    return { error: `institution must be one of: ${INSTITUTIONS.join(', ')}` }
  }
  const currency = body.currency?.trim() || 'COP'
  const last4 = body.accountNumberLast4?.trim() || null
  if (last4 && last4.length > 4) {
    return { error: 'accountNumberLast4 must be at most 4 characters' }
  }

  return {
    data: {
      name: body.name.trim(),
      type: body.type,
      institution: body.institution,
      currency,
      accountNumberLast4: last4,
      metadata: body.metadata || {},
    },
  }
}

export function validateTransactionUpdate(body: any): { data?: FinanceTransactionUpdate; error?: string } {
  const update: FinanceTransactionUpdate = {}

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || !body.description.trim()) {
      return { error: 'description must be a non-empty string' }
    }
    update.description = body.description.trim()
  }
  if (body.type !== undefined) {
    if (!TRANSACTION_TYPES.includes(body.type)) {
      return { error: `type must be one of: ${TRANSACTION_TYPES.join(', ')}` }
    }
    update.type = body.type
  }
  if (body.category !== undefined) {
    if (typeof body.category !== 'string' || !body.category.trim()) {
      return { error: 'category must be a non-empty string' }
    }
    update.category = body.category.trim()
  }

  if (Object.keys(update).length === 0) {
    return { error: 'At least one field must be provided (description, type, or category)' }
  }

  return { data: update }
}
