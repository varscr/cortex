import type { LlmDriver } from './types'
import { ClaudeCliDriver } from './driver-claude-cli'
import { OpencodeDriver } from './driver-opencode'

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
