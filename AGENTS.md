# Cortex — Project Instructions

## Overview

Personal command center / second brain — Nuxt 3 + PostgreSQL + pgvector.

## Git

- When making structural changes, update related documentation in `docs/` and sync to AGENTS.md.

## Runtime & Package Manager

- Always use **Bun** — never npm, yarn, or pnpm.
- Use `bun install`, `bun run`, `bunx` for all operations.
- Lock file is `bun.lock`, never `package-lock.json`.

## Docker-First Development

Everything runs inside Docker — never run `bun dev` locally.

```bash
sudo docker compose up -d --build         # Start all services
sudo docker compose up -d --build cortex  # Rebuild app only
sudo docker compose logs -f cortex        # View logs
sudo docker compose restart cortex        # Restart app
sudo docker compose exec postgres psql -U cortex -d cortex_db  # Access DB
```

Services: `postgres`, `cortex`, `adminer` (DB UI on :8080), `backup`

## Environment

- `.env` at project root (gitignored) — see `.env.example` for required vars

## Stack

- Nuxt 3 + Nuxt UI v2 + Tailwind CSS
- PostgreSQL via raw `pg` (no ORM) — connection pool in `server/utils/db.ts`
- Dark-only UI, zinc palette, Inter font

## Database

- Raw `pg` library, no ORM — parameterized queries with `$1, $2` syntax
- `server/utils/db.ts` exports `db` (pg.Pool), dates parsed as strings
- `RETURNING *` on INSERT/UPDATE
- Transactions: `db.connect()` then BEGIN/COMMIT/ROLLBACK, always `client.release()` in finally

## Server Utils

Auto-imported by Nuxt. Each module has three files in `server/utils/`:
- `<module>-types.ts` — TypeScript types for DB rows and API responses
- `<module>-validate.ts` — returns `{ data?, error? }`, caller throws `createError({ statusCode, statusMessage })`
- `<module>-transform.ts` — snake_case Row to camelCase API, null arrays to `[]`, NUMERIC to `parseFloat()`

Existing modules: log, kanban, profile, knowledge

## API Routes

File-based routing at `server/api/<module>/` using Nuxt conventions:
- `index.get.ts` / `index.post.ts` — list / create
- `[id].get.ts` / `[id].put.ts` / `[id].delete.ts` — get / update / delete

Status codes: 201 on create (`setResponseStatus(event, 201)`), 404 on missing, 400 on validation error.

### Handler Pattern

```
validate → db.query() → transform → return
```

### Pagination

`limit` (max 100, default 20) + `offset`, return `{ items, total, limit, offset }`

### SQL

- Parameterized queries (`$1, $2`) — never interpolate values
- `RETURNING *` on INSERT/UPDATE
- Dynamic WHERE building for filters
- Dates parsed as strings (ISO 8601), not JS Date objects
- NUMERIC stored as string in DB, `parseFloat()` in transforms

### Transactions

`db.connect()` + BEGIN/COMMIT/ROLLBACK (only when needed, e.g. card moves)

## Embeddings

- Fire-and-forget with `.catch(err => console.error(...))` — don't await in request handlers.
- Optional: if `OPENAI_API_KEY` is not set, embedding functions return early with a warning.

## Frontend

### Data Fetching

- `useFetch()` for GET — with reactive `query` + `watch`
- `$fetch()` for mutations (POST/PUT/DELETE)

### State

Vue 3 Composition API (`ref`, `reactive`, `computed`) — no Pinia, keep state local or in composables.

### UI Components

Before making frontend changes, always check `components/ui/` for reusable components:
- `PageHeader`, `FilterDropdown`, `TagInput`, `FormModal`, `ConfirmModal`

If a suitable component exists, use and extend it. If not, create new reusable components in `components/ui/` rather than one-off implementations.

### Component Structure

Components are organized by feature in subdirectories with `pathPrefix: true`:
```
components/
├── chat/        → <ChatPanel />, <ChatHeader />, etc.
├── buttons/     → <ButtonsPrimary />, <ButtonsSecondary />, etc.
├── cards/       → <Cards />, <CardsModal />, <CardsFilter />
├── ui/          → <UiPageHeader />, <UiFilterDropdown />, etc.
└── profile/     → <ProfileAboutSection />, etc.
```

### Composables

Composables follow the same pattern:
```
composables/
├── chat/        → useChatPanel(), useChatState(), useChatApi(), etc.
├── useSidebar.ts
├── useTagInput.ts
└── useFormatDate.ts
```

Nuxt auto-imports composables from `composables/*/*.ts` via `imports.dirs` config.

### UI

- `useToast()` — green success, red errors
- Icons: Heroicons via `i-heroicons-*`
- Custom classes: `.linear-bg`, `.linear-panel`, `.linear-hover`
- Sidebar via `useSidebar()` composable, links array in `layouts/default.vue`

### Forms

Native HTML + manual validation in submit handler.

## Modules

log, kanban, profile, knowledge, chat — each with full CRUD API + types/validate/transform utils.

## Chat System

Multi-provider AI chat interface with RAG-powered context. See `docs/frontend/components/chat/README.md` for component documentation.

### Providers

- **Claude CLI** (`llm-driver-claude-cli.ts`) — Uses `claude` command, Claude models
- **OpenCode** (`llm-driver-opencode.ts`) — Uses `opencode run`, free Zen models

### Architecture

- `server/utils/llm-types.ts` — LLM driver interfaces, agent config/run types
- `server/utils/llm-driver-claude-cli.ts` — Claude Code CLI subprocess driver
- `server/utils/llm-driver-opencode.ts` — OpenCode CLI subprocess driver
- `server/utils/llm-driver-factory.ts` — provider → driver factory
- `server/utils/llm-providers.ts` — available providers and models
- `server/utils/agent-loader.ts` — reads TOML configs from `agents/` with variable substitution

### Variable Substitution

Agent configs support `${VARIABLE}` syntax for runtime substitution:
```toml
[model]
provider = "${PROVIDER}"
model = "${MODEL}"
```

## Agent System

LLM-powered agents defined by TOML config files in `agents/` directory.

### Adding a new agent

Create a `.toml` file in `agents/` with `name`, `description`, and `[model]` section. No code changes needed.

### Adding a new LLM provider

1. Create `llm-driver-{name}.ts` implementing `LlmDriver`
2. Add case to `llm-driver-factory.ts`
3. Add provider + models to `llm-providers.ts`
See `docs/rag/adding-a-module.md` for full guide.

### Knowledge Ingest

- `POST /api/agents/ingest` — accepts Claude.ai export JSON, returns `{ runId }` (202)
- `GET /api/agents/runs` — list agent run history
- `GET /api/agents/runs/:id` — get run status + progress
- Pipeline in `server/utils/knowledge-ingest.ts` — sequential processing, background execution
- Dependency: `smol-toml` (TOML parser)
- Docker: Claude CLI installed in container, host `~/.claude` mounted read-only

## Database Schema

- Schema in `db/init/01-schema.sql` — runs automatically on first `docker compose up`
- Agent schema in `db/init/03-agent-schema.sql` — `knowledge_entries` + `agent_runs` tables
- Schema changes: edit existing file (all `IF NOT EXISTS`) or add a new numbered file

## OpenCode

Run `/init` in OpenCode to scan this project and generate an initial AGENTS.md. Commit this file to Git for better context.

## Do NOT

- Use an ORM — raw SQL with pg only
- Add light mode styles — dark-only
- Use Pinia — Composition API + composables
- Create one-off components — reuse and extend `components/ui/`
- Run `bun dev` locally — all development via Docker
