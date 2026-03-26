import type { LogEntryRow, LogEntry } from './types'

export function toLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    mood: row.mood,
    entryType: row.entry_type,
    isPinned: row.is_pinned,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
