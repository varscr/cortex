export interface CompletionRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  system?: string
  maxTokens?: number
  temperature?: number
  model?: string
  metadata?: Record<string, any>
}

export interface CompletionResponse {
  text: string
  usage: { inputTokens: number; outputTokens: number }
  durationMs: number
}

export interface LlmDriver {
  readonly provider: string
  complete(request: CompletionRequest): Promise<CompletionResponse>
}

export interface AgentConfig {
  name: string
  description: string
  model: {
    provider: string
    model: string
    max_tokens: number
    temperature: number
    system_prompt: string
  }
}

export interface AgentRunRow {
  id: number
  agent_name: string
  status: string
  items_total: number
  items_processed: number
  items_failed: number
  error_message: string | null
  metadata: Record<string, any>
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface AgentRun {
  id: number
  agentName: string
  status: string
  itemsTotal: number
  itemsProcessed: number
  itemsFailed: number
  errorMessage: string | null
  metadata: Record<string, any>
  startedAt: string
  completedAt: string | null
  createdAt: string
}

export function toAgentRun(row: AgentRunRow): AgentRun {
  return {
    id: row.id,
    agentName: row.agent_name,
    status: row.status,
    itemsTotal: row.items_total,
    itemsProcessed: row.items_processed,
    itemsFailed: row.items_failed,
    errorMessage: row.error_message,
    metadata: row.metadata,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}
