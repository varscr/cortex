export interface ChatSource {
  source: string
  sourceType: string
  title: string
  similarity: number
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface ChatSessionRow {
  id: number
  title: string | null
  model_provider: string
  model_name: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: number
  title: string | null
  modelProvider: string
  modelName: string
  createdAt: string
  updatedAt: string
}

// ── Message ───────────────────────────────────────────────────────────────────

export interface ChatMessageRow {
  id: number
  session_id: number
  role: 'user' | 'assistant'
  content: string
  sources: ChatSource[]
  token_count: number | null
  duration_ms: number | null
  created_at: string
}

export interface ChatMessage {
  id: number
  sessionId: number
  role: 'user' | 'assistant'
  content: string
  sources: ChatSource[]
  tokenCount: number | null
  durationMs: number | null
  createdAt: string
}

// ── Combined ──────────────────────────────────────────────────────────────────

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[]
}
