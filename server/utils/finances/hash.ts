import { createHash } from 'crypto'

export function computeTransactionHash(accountId: number, date: string, rawDescription: string, amount: string | number): string {
  const normalized = [String(accountId), date, rawDescription.trim().toLowerCase(), String(amount)]
    .join('\0')
  return createHash('sha256').update(normalized).digest('hex')
}
