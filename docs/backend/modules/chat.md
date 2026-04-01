# Chat Module

Multi-provider AI chat with RAG-powered context injection.

## Utils: `server/utils/chat/`

| File | Exports |
|------|---------|
| `types.ts` | `ChatSessionRow`, `ChatSession`, `ChatMessageRow`, `ChatMessage`, input types |
| `validate.ts` | `validateSessionInput`, `validateMessageInput`, `validateSwitchInput` |
| `transform.ts` | `toChatSession`, `toChatMessage` |
| `rag.ts` | `buildChatContext(message)` — searches embeddings for relevant context |
| `context.ts` | `buildSystemPrompt(base, contextText)` — appends date + RAG context to system prompt |

## LLM System: `server/utils/llm/`

| File | Purpose |
|------|---------|
| `types.ts` | `LlmDriver` interface, `CompletionRequest/Response`, `AgentConfig` |
| `providers.ts` | Available providers (claude-code, opencode) and their models |
| `driver-factory.ts` | `createDriver(provider)` → LlmDriver instance |
| `driver-claude-cli.ts` | Spawns `claude` CLI subprocess |
| `driver-opencode.ts` | Spawns `opencode run` CLI subprocess |

## Agent System: `server/utils/agents/`

| File | Purpose |
|------|---------|
| `loader.ts` | `loadAgentConfig(name, variables?)` — reads TOML, substitutes `${VAR}` |
| `runner.ts` | `runAgent(name, input)` — loads config, creates driver, calls complete() |

## Agent Config: `agents/chat.toml`

Supports `${PROVIDER}` and `${MODEL}` variable substitution for dynamic provider/model switching per session.

## API: `server/api/chat/`

- Sessions: create, list, get, delete
- Messages: send (POST with streaming-like response), list by session
- Switch: change provider/model mid-session

## Schema

Tables: `chat_sessions`, `chat_messages` in `db/init/03-chat.sql`
