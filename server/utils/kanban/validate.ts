import type { BoardInput, ColumnInput, CardInput, CardMoveInput, ReorderInput } from './types'

export function validateBoardInput(body: any): { data?: BoardInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Board name is required' }
  }

  return {
    data: {
      name: body.name.trim(),
      description: body.description ?? null,
    }
  }
}

export function validateColumnInput(body: any): { data?: ColumnInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Column name is required' }
  }

  return {
    data: {
      name: body.name.trim(),
      color: body.color ?? null,
    }
  }
}

export function validateCardInput(body: any): { data?: CardInput; error?: string } {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return { error: 'Card title is required' }
  }

  if (body.tags && !Array.isArray(body.tags)) {
    return { error: 'Tags must be an array of strings' }
  }

  const tasks = body.tasks ?? []
  if (!Array.isArray(tasks)) {
    return { error: 'Tasks must be an array' }
  }

  return {
    data: {
      title: body.title.trim(),
      description: body.description ?? null,
      tags: body.tags ?? [],
      dueDate: body.dueDate ?? null,
      color: body.color ?? null,
      tasks,
    }
  }
}

export function validateCardMoveInput(body: any): { data?: CardMoveInput; error?: string } {
  if (!body.cardId || typeof body.cardId !== 'number') {
    return { error: 'cardId is required and must be a number' }
  }

  if (!body.targetColumnId || typeof body.targetColumnId !== 'number') {
    return { error: 'targetColumnId is required and must be a number' }
  }

  if (typeof body.position !== 'number' || body.position < 0) {
    return { error: 'position is required and must be a non-negative number' }
  }

  return {
    data: {
      cardId: body.cardId,
      targetColumnId: body.targetColumnId,
      position: body.position,
    }
  }
}

export function validateReorderInput(body: any): { data?: ReorderInput; error?: string } {
  if (!body.orderedIds || !Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
    return { error: 'orderedIds is required and must be a non-empty array' }
  }

  if (!body.orderedIds.every((id: any) => typeof id === 'number')) {
    return { error: 'orderedIds must contain only numbers' }
  }

  return {
    data: {
      orderedIds: body.orderedIds,
    }
  }
}
