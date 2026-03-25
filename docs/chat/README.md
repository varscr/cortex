# Chat in Cortex

Cortex features a multi-provider AI chat interface that allows you to converse with an AI assistant that's aware of your personal data (journal entries, knowledge base, profile, goals).

---

## Architecture

### Components

| Layer | File | Description |
|-------|------|-------------|
| **Frontend** | `components/ChatPanel.vue` | Chat UI, message display, input |
| **API** | `server/api/chat/` | Session management, message handling |
| **RAG** | `server/utils/chat-rag.ts` | Retrieves relevant context from your data |
| **LLM Drivers** | `server/utils/llm-driver-*.ts` | Pluggable providers (Claude CLI, OpenCode) |
| **Database** | `chat_sessions`, `chat_messages` tables | Persistent storage |

### Data Flow

```
User types message
    ↓
ChatPanel.vue → POST /api/chat/message
    ↓
API: Save message, build RAG context
    ↓
RAG: Search documents table for relevant entries
    ↓
API: Load conversation history (last 20 messages)
    ↓
API: Build prompt (system + context + history)
    ↓
LLM Driver: Spawn CLI process (stateless)
    ↓
CLI → LLM API → Response
    ↓
API: Save response, return to frontend
    ↓
ChatPanel: Display message
```

### Providers

| Provider | Driver | Description |
|----------|--------|-------------|
| **Claude CLI** | `llm-driver-claude-cli.ts` | Uses `claude` command, Claude models only |
| **OpenCode** | `llm-driver-opencode.ts` | Uses `opencode run`, multiple providers |

Both drivers work identically from the API perspective — stateless CLI invocations with history injected from the database.

---

## Session Management

### Database Schema

```sql
CREATE TABLE chat_sessions (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(500),
  model_provider  VARCHAR(50) NOT NULL,  -- 'claude-code' or 'opencode'
  model_name      VARCHAR(100) NOT NULL,  -- e.g., 'claude-sonnet-4-6'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id           SERIAL PRIMARY KEY,
  session_id   INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  content      TEXT NOT NULL,
  sources      JSONB,                  -- RAG sources
  token_count  INTEGER,
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Session Lifecycle

1. **Create** — `POST /api/chat/sessions` with provider/model
2. **Message** — `POST /api/chat/message` creates session if no `sessionId` provided
3. **History** — Last 20 messages injected into prompt
4. **Delete** — `DELETE /api/chat/sessions/:id` cascades to messages

---

## Agent Configuration

Chat behavior is configured in `agents/chat.toml`:

```toml
name = "chat"
description = "Personal AI assistant with RAG across all Cortex modules"

[model]
provider = "${PROVIDER}"      # Substituted at runtime
model = "${MODEL}"            # Substituted at runtime
max_tokens = 4096
temperature = 0.3
system_prompt = """
You are a personal AI assistant embedded in the user's second brain (Cortex).
...
"""
```

The `${PROVIDER}` and `${MODEL}` variables are substituted at runtime based on the session's provider and model.

---

## Variable Substitution

The agent loader (`server/utils/agent-loader.ts`) supports `${VARIABLE}` syntax:

```typescript
export async function loadAgentConfig(
  name: string,
  variables?: Record<string, string>
): Promise<AgentConfig> {
  let content = await readFile(filePath, 'utf-8')
  if (variables) {
    content = content.replace(/\$\{(\w+)\}/g, (_, key) => variables[key] ?? '')
  }
  return parse(content)
}
```

Usage in `server/api/chat/message.post.ts`:

```typescript
const config = await loadAgentConfig('chat', {
  PROVIDER: session.model_provider,
  MODEL: session.model_name,
})
```

---

## RAG Context

Before each LLM call, the chat system retrieves relevant context:

1. **Embed user message** — Uses OpenAI embeddings
2. **Search documents** — pgvector similarity search across all modules
3. **Build context** — Formats top results into a context block
4. **Inject into prompt** — System prompt includes context

See `docs/rag/README.md` for full RAG documentation.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/sessions` | List all sessions |
| POST | `/api/chat/sessions` | Create new session |
| GET | `/api/chat/sessions/:id` | Get session with messages |
| DELETE | `/api/chat/sessions/:id` | Delete session |
| POST | `/api/chat/message` | Send message |
| GET | `/api/chat/providers` | List available providers and models |

---

## Related Documentation

- [Models Reference](models-reference.md) — Available models per provider
- [Adding a Provider](adding-a-provider.md) — How to add new LLM providers
- [RAG Documentation](../rag/README.md) — Semantic search architecture

---

## Current Status

| Feature | Status |
|---------|--------|
| Multi-provider support | ✅ done |
| Session management | ✅ done |
| Message history | ✅ done |
| RAG context injection | ✅ done |
| Variable substitution | ✅ done |
| Provider selector UI | ✅ done |
| Model selector UI | ✅ done |
