export interface LlmModelOption {
  id: string
  name: string
  description: string
}

export interface LlmProviderOption {
  id: string
  name: string
  models: LlmModelOption[]
  defaultModel: string
}

export const LLM_PROVIDERS: LlmProviderOption[] = [
  {
    id: 'claude-code',
    name: 'Claude CLI',
    models: [
      { id: 'claude-opus-4-6',          name: 'Opus',   description: 'Most capable' },
      { id: 'claude-sonnet-4-6',         name: 'Sonnet', description: 'Balanced' },
      { id: 'claude-haiku-4-5-20251001', name: 'Haiku',  description: 'Fast' },
    ],
    defaultModel: 'claude-sonnet-4-6',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    models: [
      { id: 'big-pickle',           name: 'Big Pickle',         description: 'Free - Stealth model' },
      { id: 'minimax-m2.1-free',    name: 'MiniMax M2.1 Free', description: 'Free' },
      { id: 'glm-4.7-free',         name: 'GLM 4.7 Free',      description: 'Free' },
      { id: 'kimi-k2.5-free',       name: 'Kimi K2.5 Free',    description: 'Free' },
      { id: 'gpt-5-nano',           name: 'GPT 5 Nano',         description: 'Free' },
    ],
    defaultModel: 'big-pickle',
  },
]

export const DEFAULT_PROVIDER = 'claude-code'
export const DEFAULT_MODEL = 'claude-sonnet-4-6'

export function getProvider(id: string): LlmProviderOption | undefined {
  return LLM_PROVIDERS.find(p => p.id === id)
}

export function isValidProviderModel(provider: string, model: string): boolean {
  return !!getProvider(provider)?.models.find(m => m.id === model)
}

export function getModelName(providerId: string, modelId: string): string {
  return getProvider(providerId)?.models.find(m => m.id === modelId)?.name ?? modelId
}
