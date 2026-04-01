export interface ChatMessageInput {
  content: string
  sessionId?: number
  provider?: string
  model?: string
}

export function validateMessageInput(body: unknown): { data?: ChatMessageInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body' }
  const b = body as Record<string, unknown>

  if (!b.content || typeof b.content !== 'string' || !b.content.trim()) {
    return { error: 'content is required' }
  }

  if (b.sessionId !== undefined && b.sessionId !== null) {
    const id = Number(b.sessionId)
    if (!Number.isInteger(id) || id < 1) return { error: 'sessionId must be a positive integer' }
  }

  if ((b.provider !== undefined && b.provider !== null) !== (b.model !== undefined && b.model !== null)) {
    return { error: 'provider and model must be provided together' }
  }

  if (b.provider && b.model) {
    if (!isValidProviderModel(String(b.provider), String(b.model))) {
      return { error: `Invalid provider/model combination: ${b.provider}/${b.model}` }
    }
  }

  return {
    data: {
      content: (b.content as string).trim(),
      sessionId: (b.sessionId !== undefined && b.sessionId !== null) ? Number(b.sessionId) : undefined,
      provider: b.provider ? String(b.provider) : undefined,
      model: b.model ? String(b.model) : undefined,
    },
  }
}
