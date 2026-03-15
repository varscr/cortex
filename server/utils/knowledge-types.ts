export const KNOWLEDGE_CATEGORIES = [
  'programming', 'architecture', 'devops', 'concept',
  'workflow', 'tool', 'pattern', 'other',
] as const
export type KnowledgeCategory = typeof KNOWLEDGE_CATEGORIES[number]

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number]

export interface KnowledgeEntryRow {
  id: number
  title: string
  content: string
  category: string
  tags: string[] | null
  confidence: string
  source_conversation_id: string | null
  source_conversation_title: string | null
  is_reviewed: boolean
  created_at: string
  updated_at: string
}

export interface KnowledgeEntry {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  confidence: string
  sourceConversationId: string | null
  sourceConversationTitle: string | null
  isReviewed: boolean
  createdAt: string
  updatedAt: string
}

export interface KnowledgeEntryInput {
  title: string
  content: string
  category?: string
  tags?: string[]
  confidence?: string
  sourceConversationId?: string | null
  sourceConversationTitle?: string | null
  isReviewed?: boolean
}
