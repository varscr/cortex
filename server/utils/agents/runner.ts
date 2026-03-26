import { loadAgentConfig } from './loader'
import { createDriver } from '../llm/driver-factory'
import type { CompletionResponse } from '../llm/types'

export async function runAgent(agentName: string, input: string): Promise<CompletionResponse> {
  const config = await loadAgentConfig(agentName)
  const driver = createDriver(config.model.provider)

  return driver.complete({
    messages: [{ role: 'user', content: input }],
    system: config.model.system_prompt,
    model: config.model.model,
    maxTokens: config.model.max_tokens,
    temperature: config.model.temperature,
  })
}
