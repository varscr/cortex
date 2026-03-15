import type { LlmDriver } from './llm-types'
import { ClaudeCliDriver } from './llm-driver-claude-cli'

export function createDriver(provider: string): LlmDriver {
  switch (provider) {
    case 'claude-code':
      return new ClaudeCliDriver()
    default:
      throw new Error(`Unknown LLM provider: ${provider}`)
  }
}
