import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'smol-toml'
import type { AgentConfig } from './llm-types'

const AGENTS_DIR = join(process.cwd(), 'agents')

export async function loadAgentConfig(name: string): Promise<AgentConfig> {
  const filePath = join(AGENTS_DIR, `${name}.toml`)
  const content = await readFile(filePath, 'utf-8')
  const config = parse(content) as unknown as AgentConfig
  return config
}

export async function listAgents(): Promise<string[]> {
  try {
    const files = await readdir(AGENTS_DIR)
    return files
      .filter(f => f.endsWith('.toml'))
      .map(f => f.replace('.toml', ''))
  } catch {
    return []
  }
}
