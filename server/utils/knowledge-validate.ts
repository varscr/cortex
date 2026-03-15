import { KNOWLEDGE_CATEGORIES, CONFIDENCE_LEVELS } from './knowledge-types'
import type { KnowledgeEntryInput } from './knowledge-types'

export function validateKnowledgeInput(body: any): { data?: KnowledgeEntryInput; error?: string } {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return { error: 'Title is required' }
  }

  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    return { error: 'Content is required' }
  }

  if (body.category && !KNOWLEDGE_CATEGORIES.includes(body.category)) {
    return { error: `Invalid category. Must be one of: ${KNOWLEDGE_CATEGORIES.join(', ')}` }
  }

  if (body.confidence && !CONFIDENCE_LEVELS.includes(body.confidence)) {
    return { error: `Invalid confidence. Must be one of: ${CONFIDENCE_LEVELS.join(', ')}` }
  }

  if (body.tags && !Array.isArray(body.tags)) {
    return { error: 'Tags must be an array of strings' }
  }

  if (body.isReviewed !== undefined && typeof body.isReviewed !== 'boolean') {
    return { error: 'isReviewed must be a boolean' }
  }

  return {
    data: {
      title: body.title.trim(),
      content: body.content.trim(),
      category: body.category ?? 'other',
      tags: body.tags ?? [],
      confidence: body.confidence ?? 'medium',
      sourceConversationId: body.sourceConversationId ?? null,
      sourceConversationTitle: body.sourceConversationTitle ?? null,
      isReviewed: body.isReviewed,
    }
  }
}
