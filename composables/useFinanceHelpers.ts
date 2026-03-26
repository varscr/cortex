const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  food: { icon: 'i-heroicons-cake', color: 'text-orange-400', label: 'Food' },
  transport: { icon: 'i-heroicons-truck', color: 'text-blue-400', label: 'Transport' },
  subscription: { icon: 'i-heroicons-arrow-path', color: 'text-purple-400', label: 'Subscription' },
  salary: { icon: 'i-heroicons-banknotes', color: 'text-emerald-400', label: 'Salary' },
  utilities: { icon: 'i-heroicons-bolt', color: 'text-yellow-400', label: 'Utilities' },
  entertainment: { icon: 'i-heroicons-musical-note', color: 'text-pink-400', label: 'Entertainment' },
  health: { icon: 'i-heroicons-heart', color: 'text-red-400', label: 'Health' },
  shopping: { icon: 'i-heroicons-shopping-bag', color: 'text-cyan-400', label: 'Shopping' },
  transfer: { icon: 'i-heroicons-arrows-right-left', color: 'text-zinc-400', label: 'Transfer' },
  fee: { icon: 'i-heroicons-receipt-percent', color: 'text-amber-400', label: 'Fee' },
  interest: { icon: 'i-heroicons-chart-bar', color: 'text-lime-400', label: 'Interest' },
  education: { icon: 'i-heroicons-academic-cap', color: 'text-indigo-400', label: 'Education' },
  housing: { icon: 'i-heroicons-home', color: 'text-teal-400', label: 'Housing' },
  other: { icon: 'i-heroicons-tag', color: 'text-zinc-500', label: 'Other' },
  uncategorized: { icon: 'i-heroicons-question-mark-circle', color: 'text-zinc-600', label: 'Uncategorized' },
}

const ACCOUNT_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  savings: { icon: 'i-heroicons-building-library', color: 'text-blue-400', label: 'Savings' },
  credit_card: { icon: 'i-heroicons-credit-card', color: 'text-purple-400', label: 'Credit Card' },
}

const INSTITUTION_CONFIG: Record<string, { label: string; color: string }> = {
  bancolombia: { label: 'Bancolombia', color: 'text-yellow-400' },
  nu: { label: 'NU', color: 'text-purple-400' },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

export const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'payment', label: 'Payment' },
  { value: 'fee', label: 'Fee' },
  { value: 'interest', label: 'Interest' },
  { value: 'transfer', label: 'Transfer' },
]

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
]

export const INSTITUTION_OPTIONS = [
  { value: 'bancolombia', label: 'Bancolombia' },
  { value: 'nu', label: 'NU' },
]

export function useFinanceHelpers() {
  const getCategoryIcon = (category: string) => CATEGORY_CONFIG[category]?.icon || CATEGORY_CONFIG.uncategorized.icon
  const getCategoryColor = (category: string) => CATEGORY_CONFIG[category]?.color || CATEGORY_CONFIG.uncategorized.color
  const getCategoryLabel = (category: string) => CATEGORY_CONFIG[category]?.label || category

  const getAccountTypeIcon = (type: string) => ACCOUNT_TYPE_CONFIG[type]?.icon || 'i-heroicons-building-library'
  const getAccountTypeColor = (type: string) => ACCOUNT_TYPE_CONFIG[type]?.color || 'text-zinc-400'
  const getAccountTypeLabel = (type: string) => ACCOUNT_TYPE_CONFIG[type]?.label || type

  const getInstitutionLabel = (inst: string) => INSTITUTION_CONFIG[inst]?.label || inst
  const getInstitutionColor = (inst: string) => INSTITUTION_CONFIG[inst]?.color || 'text-zinc-400'

  return {
    getCategoryIcon, getCategoryColor, getCategoryLabel,
    getAccountTypeIcon, getAccountTypeColor, getAccountTypeLabel,
    getInstitutionLabel, getInstitutionColor,
  }
}

export function formatCOP(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('es-CO', { maximumFractionDigits: 0 })
  return amount < 0 ? `-$${formatted}` : `$${formatted}`
}
