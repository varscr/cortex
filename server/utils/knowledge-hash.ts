import { createHash } from 'crypto'

export function computeContentHash(title: string, content: string): string {
  const normalized = [title, content]
    .map(s => s.trim().toLowerCase().replace(/\s+/g, ' '))
    .join('\0')

  return createHash('sha256').update(normalized).digest('hex')
}
