import type { KnowledgeEntryRow, KnowledgeEntry } from './types'

export function toKnowledgeEntry(row: KnowledgeEntryRow): KnowledgeEntry {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    confidence: row.confidence,
    sourceConversationId: row.source_conversation_id,
    sourceConversationTitle: row.source_conversation_title,
    isReviewed: row.is_reviewed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
