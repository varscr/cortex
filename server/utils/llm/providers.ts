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
      { id: 'big-pickle',           name: 'Big Pickle',           description: 'Free - Stealth model' },
      { id: 'minimax-m2.5-free',    name: 'MiniMax M2.5 Free',   description: 'Free' },
      { id: 'qwen3.6-plus-free',    name: 'Qwen3.6 Plus Free',   description: 'Free' },
      { id: 'gpt-5-nano',           name: 'GPT-5 Nano',           description: 'Free' },
      { id: 'nemotron-3-super-free', name: 'Nemotron 3 Super Free', description: 'Free' },
      { id: 'mimo-v2-omni-free',    name: 'MiMo V2 Omni Free',   description: 'Free' },
      { id: 'mimo-v2-pro-free',     name: 'MiMo V2 Pro Free',    description: 'Free' },
    ],
    defaultModel: 'minimax-m2.5-free',
  },
]

export const DEFAULT_PROVIDER = 'opencode'
export const DEFAULT_MODEL = 'minimax-m2.5-free'

export function getProvider(id: string): LlmProviderOption | undefined {
  return LLM_PROVIDERS.find(p => p.id === id)
}

export function isValidProviderModel(provider: string, model: string): boolean {
  return !!getProvider(provider)?.models.find(m => m.id === model)
}

