# Knowledge Module

Structured knowledge base extracted from conversations via AI.

## Utils: `server/utils/knowledge/`

| File | Exports |
|------|---------|
| `types.ts` | `KNOWLEDGE_CATEGORIES`, `CONFIDENCE_LEVELS`, `KnowledgeEntryRow`, `KnowledgeEntry`, `KnowledgeEntryInput` |
| `validate.ts` | `validateKnowledgeInput(body)` |
| `transform.ts` | `toKnowledgeEntry(row)` |
| `hash.ts` | `computeContentHash(title, content)` — SHA256 for dedup |
| `embed.ts` | `upsertKnowledgeEmbedding(row)`, `deleteKnowledgeEmbedding(id)` |
| `ingest.ts` | `runKnowledgeIngest(conversations)` — background pipeline |

## Ingest Pipeline

1. Accepts Claude.ai conversation export (JSON array)
2. Creates `agent_runs` record, returns runId (202)
3. Background: for each conversation, calls `knowledge-ingest` agent
4. Agent extracts structured entries (title, content, category, tags, confidence)
5. Deduplicates via `content_hash` unique index
6. Fire-and-forget embedding upsert

## Agent: `agents/knowledge-ingest.toml`

Uses Claude Sonnet, temperature 0.2. Extracts JSON array of knowledge entries from conversation text.

## API: `server/api/knowledge/`

Standard CRUD with filters: `category`, `confidence`, `tag`, `search`, `isReviewed`. Bulk delete supported.

## Schema

Table: `knowledge_entries` in `db/init/02-agent.sql`, dedup index in `db/init/02-agent.sql` too.
