import { MOODS, ENTRY_TYPES } from './types'
import type { LogEntryInput } from './types'

export function validateLogInput(body: any): { data?: LogEntryInput; error?: string } {
  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    return { error: 'Content is required' }
  }

  if (body.mood && !MOODS.includes(body.mood)) {
    return { error: `Invalid mood. Must be one of: ${MOODS.join(', ')}` }
  }

  if (body.entryType && !ENTRY_TYPES.includes(body.entryType)) {
    return { error: `Invalid entry type. Must be one of: ${ENTRY_TYPES.join(', ')}` }
  }

  if (body.tags && !Array.isArray(body.tags)) {
    return { error: 'Tags must be an array of strings' }
  }

  if (body.isPinned !== undefined && typeof body.isPinned !== 'boolean') {
    return { error: 'isPinned must be a boolean' }
  }

  return {
    data: {
      title: body.title ?? null,
      content: body.content.trim(),
      tags: body.tags ?? [],
      mood: body.mood ?? null,
      entryType: body.entryType ?? 'journal',
      isPinned: body.isPinned,
      date: body.date ?? undefined,
    }
  }
}
