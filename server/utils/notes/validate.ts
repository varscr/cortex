import { NOTE_TYPES } from './types'
import type { NoteInput } from './types'

export function validateNoteInput(body: any): { data?: NoteInput; error?: string } {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return { error: 'Title is required' }
  }

  if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
    return { error: 'Content is required' }
  }

  if (body.type && !NOTE_TYPES.includes(body.type)) {
    return { error: `Invalid type. Must be one of: ${NOTE_TYPES.join(', ')}` }
  }

  if (body.tags && !Array.isArray(body.tags)) {
    return { error: 'Tags must be an array of strings' }
  }

  if (body.isPinned !== undefined && typeof body.isPinned !== 'boolean') {
    return { error: 'isPinned must be a boolean' }
  }

  return {
    data: {
      title: body.title.trim(),
      content: body.content.trim(),
      type: body.type ?? 'general',
      tags: body.tags ?? [],
      isPinned: body.isPinned ?? false,
    }
  }
}
