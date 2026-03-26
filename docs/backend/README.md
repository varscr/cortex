# Backend Documentation

Server-side architecture for Cortex. Covers utils organization, module patterns, database conventions, API routes, and the agent/LLM system.

---

## Utils Structure

All server utilities live in `server/utils/` organized by domain. Nuxt auto-imports from subdirectories recursively.

```
server/utils/
├── db.ts                  # Shared pg.Pool, date type parsers
├── log/                   # Log entries module
├── kanban/                # Kanban boards module
├── knowledge/             # Knowledge base module (with ingest pipeline)
├── chat/                  # Chat module (RAG, context)
├── profile/               # Profile module
├── llm/                   # LLM driver system (types, providers, drivers)
├── agents/                # Agent loader + runner
├── embed/                 # Embedding/vector search core
└── finances/              # Finances module (accounts, statements, transactions)
```

### Shared: `db.ts`

Exports `db` (pg.Pool). Dates and timestamps are parsed as ISO 8601 strings, not JS Date objects.

---

## Module Pattern

Each module follows a consistent triplet of files:

| File | Purpose |
|------|---------|
| `types.ts` | Constants, DB row interfaces (snake_case), API interfaces (camelCase), input interfaces |
| `validate.ts` | Input validation, returns `{ data?, error? }` — caller throws `createError()` |
| `transform.ts` | Row-to-API conversion: snake_case → camelCase, null arrays → `[]`, NUMERIC → `parseFloat()` |

Some modules have additional files:
- `hash.ts` — Content hashing for deduplication (SHA256)
- `embed.ts` — Embedding helpers for vector search
- `ingest.ts` — Background processing pipelines

See [Module Pattern Guide](./modules/README.md) for details and examples.

---

## Database Conventions

- **Driver:** Raw `pg` library, no ORM. Parameterized queries with `$1, $2` syntax.
- **Naming:** snake_case for tables and columns
- **Timestamps:** `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Arrays:** `TEXT[]`
- **JSON:** `JSONB DEFAULT '{}'`
- **IDs:** `SERIAL PRIMARY KEY`
- **Schema files:** `db/init/` numbered sequentially, all use `IF NOT EXISTS`
- **Queries:** Always `RETURNING *` on INSERT/UPDATE
- **Transactions:** `db.connect()` + BEGIN/COMMIT/ROLLBACK, `client.release()` in finally

---

## API Route Conventions

File-based routing at `server/api/<module>/`:

| Pattern | HTTP | Purpose |
|---------|------|---------|
| `index.get.ts` | GET | List with pagination |
| `index.post.ts` | POST | Create (returns 201) |
| `[id].get.ts` | GET | Get single |
| `[id].put.ts` | PUT | Update |
| `[id].delete.ts` | DELETE | Delete |

### Handler Pattern
```
validate → db.query() → transform → return
```

### Status Codes
- `201` on create (`setResponseStatus(event, 201)`)
- `400` on validation error
- `404` on not found
- `409` on duplicate (PostgreSQL constraint violation)

### Pagination
`limit` (max 100, default 20) + `offset`, returns `{ items, total, limit, offset }`.

---

## Agent & LLM System

### Agent Configs
TOML files in `agents/` directory. Each defines name, description, and `[model]` section with provider, model, max_tokens, temperature, and system_prompt.

Supports `${VARIABLE}` substitution for runtime values.

### LLM Drivers
- `llm/types.ts` — `LlmDriver` interface, `CompletionRequest/Response`
- `llm/providers.ts` — Available providers and models
- `llm/driver-factory.ts` — `createDriver(provider)` factory
- `llm/driver-claude-cli.ts` — Claude Code CLI subprocess driver
- `llm/driver-opencode.ts` — OpenCode CLI subprocess driver

### Agent Runner
`agents/runner.ts` — `runAgent(agentName, input)` loads config, creates driver, calls `complete()`.

### Background Processing
Pattern used by knowledge ingest and finance ingest:
1. Create `agent_runs` record (status=running)
2. Return runId immediately (202)
3. Fire-and-forget processing via `.catch()`
4. Update `agent_runs` progress as items are processed
5. Frontend polls `/api/agents/runs/:id` for status

---

## Embedding / RAG System

- `embed/core.ts` — `upsertDocument()`, `deleteDocument()`, `searchDocuments()` using pgvector
- `embed/embed.ts` — OpenAI `text-embedding-3-small` (1536 dimensions)
- Per-module embed files (e.g., `knowledge/embed.ts`) build text and call core
- Fire-and-forget: never awaited in request handlers, optional if no `OPENAI_API_KEY`
- Source naming: `{module}/{id}` (e.g., `knowledge/42`, `profile/about/1`)

---

## Related Documentation

- [Module Pattern Guide](./modules/README.md)
- [Frontend Documentation](../frontend/README.md)
- [RAG Documentation](../rag/README.md)
