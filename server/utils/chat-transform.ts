export function toChatSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    title: row.title,
    modelProvider: row.model_provider,
    modelName: row.model_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    sources: Array.isArray(row.sources) ? row.sources : [],
    tokenCount: row.token_count,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  }
}
