# Chat Backend — Implementation Plan

## Overview
Personal AI assistant with RAG across all Cortex modules. Uses pgvector semantic search + profile/summary data as context for Claude.

## Step 1: Schema — `db/init/04-chat-schema.sql`

```sql
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    model_provider VARCHAR(50) NOT NULL DEFAULT 'claude-code',
    model_name VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    token_count INTEGER,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
```

## Step 2: Types + Transform + Validate

### `server/utils/chat-types.ts`
- `ChatSessionRow`, `ChatSession` (camelCase API type)
- `ChatMessageRow`, `ChatMessage`
- `ChatSessionDetail` = ChatSession + messages array
- `ChatMessageInput` = `{ content: string, sessionId?: number }`
- `ChatSource` = `{ source: string, sourceType: string, title: string, score: number }`

### `server/utils/chat-transform.ts`
- `toChatSession(row)` — snake_case → camelCase
- `toChatMessage(row)` — snake_case → camelCase

### `server/utils/chat-validate.ts`
- `validateChatMessageInput(body)` → `{ data?, error? }`

## Step 3: Agent Config — `agents/chat.toml`

```toml
name = "chat"
description = "Personal AI assistant with RAG across all Cortex modules"

[model]
provider = "claude-code"
model = "sonnet"
max_tokens = 4096
temperature = 0.3
system_prompt = """
You are Cortex, a personal AI assistant. You have access to the user's personal data
including their journal entries, knowledge base, profile, finances, trading activity,
and project boards.

When answering:
- Use the provided context for accurate, personalized answers
- Cite sources when referencing specific entries
- Be concise but thorough
- Discuss patterns, trends, and insights across modules
- If you don't have enough context, say so honestly
"""
```

Change `provider` to `"anthropic"` to switch to API. TOML reloads on each call.

## Step 4: RAG Engine — `server/utils/chat-rag.ts`

Main function: `buildChatContext(userMessage) → { contextText, sources }`

### Pipeline:
1. Embed user message with OpenAI `text-embedding-3-small`
2. Semantic search `documents` table (top 10 results across log + knowledge)
3. Always fetch profile (about, skills, active goals, current experience)
4. Fetch summaries: recent finance monthly_summary, trading stats, kanban board overview
5. Assemble into structured context string (~12,000 char budget)

### Semantic search query:
```sql
SELECT content, source, source_type, metadata,
       1 - (embedding <=> $1::vector) AS score
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 10
```

### Graceful degradation:
If `OPENAI_API_KEY` not set, skip semantic search. Chat still works with profile + summaries.

## Step 5: System Prompt Builder — `server/utils/chat-context.ts`

`buildSystemPrompt(basePrompt, contextText) → string`

Combines TOML system_prompt + RAG context + current date.

## Step 6: Core Endpoint — `server/api/chat/message.post.ts`

Flow:
1. Validate input `{ content, sessionId? }`
2. Create or get session
3. Store user message in `chat_messages`
4. `buildChatContext(content)` → contextText + sources
5. Load last 20 messages as conversation history
6. Load `agents/chat.toml` config
7. `buildSystemPrompt()` with context
8. `createDriver(provider).complete(request)`
9. Store assistant message with sources, token_count, duration_ms
10. Auto-title: fire-and-forget on first message
11. Return assistant ChatMessage + session info

## Step 7: Session CRUD

- `GET /api/chat/sessions` — list (paginated, newest first)
- `POST /api/chat/sessions` — create empty session
- `GET /api/chat/sessions/[id]` — session + all messages
- `DELETE /api/chat/sessions/[id]` — delete (cascade)
- `PATCH /api/chat/sessions/[id]` — update title

## Step 8: Anthropic API Driver

### `server/utils/llm-driver-anthropic.ts`
- Uses raw `fetch()` to `https://api.anthropic.com/v1/messages`
- No SDK dependency
- Reads `ANTHROPIC_API_KEY` from env

### `server/utils/llm-driver-factory.ts`
- Add `case 'anthropic': return new AnthropicApiDriver()`

### Config changes:
- `.env.example` — add `ANTHROPIC_API_KEY=`
- `docker-compose.yml` — add `ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}` to cortex environment

## File List

| File | Action |
|---|---|
| `db/init/04-chat-schema.sql` | Create |
| `server/utils/chat-types.ts` | Create |
| `server/utils/chat-transform.ts` | Create |
| `server/utils/chat-validate.ts` | Create |
| `server/utils/chat-rag.ts` | Create |
| `server/utils/chat-context.ts` | Create |
| `agents/chat.toml` | Create |
| `server/api/chat/message.post.ts` | Create |
| `server/api/chat/sessions/index.get.ts` | Create |
| `server/api/chat/sessions/index.post.ts` | Create |
| `server/api/chat/sessions/[id].get.ts` | Create |
| `server/api/chat/sessions/[id].delete.ts` | Create |
| `server/api/chat/sessions/[id].patch.ts` | Create |
| `server/utils/llm-driver-anthropic.ts` | Create |
| `server/utils/llm-driver-factory.ts` | Modify |
| `.env.example` | Modify |
| `docker-compose.yml` | Modify |

## Verification

```bash
# 1. Apply schema
sudo docker compose exec postgres psql -U cortex -d cortex_db -f /docker-entrypoint-initdb.d/04-chat-schema.sql

# 2. Test chat
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"content":"What do you know about me?"}'

# 3. Test with session
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"content":"Tell me more", "sessionId": 1}'

# 4. List sessions
curl http://localhost:3000/api/chat/sessions
```
