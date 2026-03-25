import type { LlmDriver } from './llm-types'
import { ClaudeCliDriver } from './llm-driver-claude-cli'
import { OpencodeDriver } from './llm-driver-opencode'

export function createDriver(provider: string): LlmDriver {
  switch (provider) {
    case 'claude-code':
      return new ClaudeCliDriver()
    case 'opencode':
      return new OpencodeDriver()
    default:
      throw new Error(`Unknown LLM provider: ${provider}`)
  }
}
