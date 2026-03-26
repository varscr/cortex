# RAG in Cortex

Cortex uses **Retrieval-Augmented Generation (RAG)** to make all your personal data searchable by meaning — not just keywords — and to eventually power the chat interface (see `docs/future/chat-agent.md`).

---

## What is RAG?

RAG is a three-step loop:

1. **Index** — convert your data into vectors (embeddings) and store them
2. **Retrieve** — when a query comes in, find the most semantically similar pieces of data
3. **Generate** — feed the retrieved context to an LLM to produce a grounded answer

This project currently implements **Classic RAG** (steps 1 and 2 are done, step 3 is the chat). Advanced RAG features like reranking and hybrid search are on the roadmap.

---

## Architecture

### The `documents` table

All vectors live in a single shared table regardless of module:

```sql
CREATE TABLE documents (
  id          SERIAL PRIMARY KEY,
  content     TEXT NOT NULL,           -- the text that was embedded
  embedding   vector(1536),            -- OpenAI text-embedding-3-small
  source      VARCHAR(500) NOT NULL,   -- e.g. 'log/42', 'profile/experience/3'
  source_type VARCHAR(50) NOT NULL,    -- e.g. 'log', 'knowledge', 'profile'
  chunk_index INTEGER DEFAULT 0,       -- for future multi-chunk support
  metadata    JSONB DEFAULT '{}',      -- module-specific fields for display
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);
```

**Source naming convention:**

| Module    | source pattern               | source_type  |
|-----------|------------------------------|--------------|
| Log       | `log/{id}`                   | `log`        |
| Knowledge | `knowledge/{id}`             | `knowledge`  |
| Profile   | `profile/{section}/{id}`     | `profile`    |
| Finances  | `finances/transaction/{id}`  | `finances`   |

Profile uses a single `source_type = 'profile'` for all sections. The section is in `metadata.section` (e.g. `experience`, `project`, `skill`).

---

## Indexing Pipeline (write path)

### What triggers an embed

Every mutating API route (POST, PUT, DELETE) fires an embedding operation:

- **POST / PUT** → `upsert*Embedding(row)` — replaces the old vector
- **DELETE** → `delete*Embedding(id)` — removes from documents

### Fire-and-forget pattern

Embeddings are **not awaited**. They run in the background so the API response is never blocked:

```typescript
upsertExperienceEmbedding(result.rows[0])
  .catch(err => console.error('[embed] failed for profile/experience', result.rows[0].id, err))
```

This is correct here because:
- Embeddings are derived data — if they fail, the source record still exists and can be re-indexed later
- The user experience doesn't depend on the vector being ready immediately

### DELETE + INSERT (not UPDATE)

Every upsert deletes the existing document and inserts a fresh one. This keeps the logic simple and ensures the embedded text always reflects the current content exactly.

### `embed-core.ts` — the shared foundation

All modules delegate to four exported functions in `server/utils/embed-core.ts`:

```typescript
// Write
upsertDocument(source, sourceType, content, metadata): Promise<void>
deleteDocument(source): Promise<void>

// Read
searchDocuments(query, opts?): Promise<SearchResult[]>

// Type
interface SearchResult {
  id: number
  source: string
  sourceType: string
  content: string
  metadata: Record<string, unknown>
  similarity: number  // 0–1, higher = more similar
}
```

If `OPENAI_API_KEY` is not set, all three functions return early silently. One warning is logged on first call.

### Per-module embed files

Each module has its own `*-embed.ts` file with a `buildText(row)` function that produces the text that gets embedded. The rest is delegated to `embed-core`.

| File | Module | Exported functions |
|------|--------|--------------------|
| `server/utils/embed.ts` | log | `upsertLogEmbedding`, `deleteLogEmbedding` |
| `server/utils/knowledge-embed.ts` | knowledge | `upsertKnowledgeEmbedding`, `deleteKnowledgeEmbedding` |
| `server/utils/profile-embed.ts` | profile | `upsertExperienceEmbedding`, `upsertProjectEmbedding`, `upsertSkillEmbedding`, `upsertEducationEmbedding`, `upsertCertificationEmbedding`, `upsertGoalEmbedding`, `upsertAboutEmbedding` + delete equivalents |

---

## Text Format Design

**Text quality directly determines retrieval quality.** The embedding model encodes semantic meaning — richer, more natural text produces better vectors.

### Why prose beats key-value

```
❌ Bad:  company=Acme role=Engineer stack=TypeScript
✅ Good: Role: Senior Engineer at Acme Corp (Full-time, 2021–present, Remote)
         Tech stack: TypeScript, PostgreSQL
         Highlights: Led migration to microservices
```

### Rules

1. **Start with the most semantically rich field** — the type label + name/title
2. **Join arrays as comma-separated strings** — `tag1, tag2, tag3`
3. **Include null-check** — skip fields that are null rather than emitting `null` as text
4. **Use natural labels** — `Tech stack:` not `tech_stack=`
5. **Omit navigational metadata** — URLs, IDs, avatars add no semantic signal

### Examples by module

**Log entry:**
```
[journal] Weekly reflection
Had a productive week focusing on the RAG implementation...
Tags: productivity, engineering
Mood: happy
```

**Knowledge entry:**
```
[engineering] pgvector cosine similarity
To compute cosine similarity in PostgreSQL use the <=> operator...
Tags: database, postgresql, vectors
Confidence: high
```

**Experience:**
```
Role: Senior Engineer at Acme Corp (Full-time, 2021–present, Remote)
Description: Led full-stack development across three product teams
Tech stack: TypeScript, React, PostgreSQL, Kubernetes
Highlights: Reduced deploy time by 60%; Mentored 3 junior engineers
```

**Skill:**
```
Skill: TypeScript — Backend (Advanced, 5/5)
Notes: Primary language for 4+ years, used in all production systems
```

**Goal:**
```
Goal [in_progress]: Launch personal SaaS product
Category: career | Target: 2025-12-31
Description: Build and ship a revenue-generating side project by end of year
```

---

## Retrieval (read path)

### `searchDocuments`

```typescript
const results = await searchDocuments('kubernetes deployment experience', {
  sourceTypes: ['profile', 'knowledge'],  // optional — omit to search all
  limit: 10,                              // max 100
})
```

SQL used internally:
```sql
SELECT id, source, source_type, content, metadata,
       1 - (embedding <=> $1::vector) AS similarity
FROM documents
WHERE embedding IS NOT NULL
  AND ($2::text[] IS NULL OR source_type = ANY($2::text[]))
ORDER BY embedding <=> $1::vector
LIMIT $3
```

`<=>` is pgvector's **cosine distance** operator. `1 - distance` converts to **similarity** (1 = identical, 0 = orthogonal). The HNSW index makes this fast even with millions of vectors.

### Search endpoint

```
GET /api/search?q=<query>&sourceTypes=<comma-list>&limit=<n>
```

**Parameters:**

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `q` | yes | — | The search query |
| `sourceTypes` | no | all | Comma-separated filter: `log,knowledge,profile` |
| `limit` | no | 10 | Max results (capped at 100) |

**Response:**
```json
{
  "results": [
    {
      "id": 12,
      "source": "profile/experience/3",
      "sourceType": "profile",
      "content": "Role: Senior Engineer at Acme Corp...",
      "metadata": { "section": "experience", "company": "Acme Corp", "isCurrent": true },
      "similarity": 0.87
    }
  ],
  "total": 1,
  "query": "kubernetes deployment experience"
}
```

**Examples:**
```
GET /api/search?q=React projects                        # search everything
GET /api/search?q=backend skills&sourceTypes=profile    # profile only
GET /api/search?q=deployment&sourceTypes=knowledge,log  # two modules
GET /api/search?q=career goals&sourceTypes=profile&limit=5
```

---

## Current Status

| Feature | Status |
|---------|--------|
| `documents` table + HNSW index | ✅ done |
| Log embeddings (create/update/delete) | ✅ done |
| Knowledge embeddings (create/update/delete) | ✅ done |
| Profile embeddings (all sections) | ✅ done |
| `embed-core.ts` shared foundation | ✅ done |
| `GET /api/search` retrieval endpoint | ✅ done |
| Finance embeddings | ⏳ when module returns |
| RAG injection into chat agent | ✅ done - see `docs/frontend/components/chat/README.md` |
| Hybrid search (keyword + vector) | 🔮 advanced RAG |
| Reranking | 🔮 advanced RAG |
| Multi-chunk support for long documents | 🔮 future (`chunk_index` field ready) |

---

## Advanced RAG Roadmap

When the chat is built and search quality needs improving:

1. **Hybrid search** — combine vector similarity with PostgreSQL full-text search (`tsvector`). Catches exact keyword matches that semantic search can miss.

2. **Reranking** — after retrieving top-K results, pass them through a cross-encoder model to reorder by true relevance. Significant quality improvement at the cost of one extra LLM call.

3. **Relevance filtering** — discard results below a similarity threshold (e.g. `< 0.6`) to avoid injecting irrelevant context into prompts.

4. **Multi-chunk indexing** — for long entries (e.g. `cv_html`, long log posts), split into overlapping chunks and index each. The `chunk_index` column is already in the schema.

5. **Query expansion** — rewrite the user's query with an LLM before embedding to improve recall.
