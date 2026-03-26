# Module Pattern Guide

Every Cortex backend module follows the same three-file pattern in `server/utils/<module>/`.

---

## File Triplet

### `types.ts`

Defines three layers of types:

1. **Constants** — string literal arrays used for validation
2. **Row interfaces** — snake_case, matching DB columns exactly. NUMERIC columns are `string` (pg returns strings for NUMERIC). Arrays are `type[] | null`.
3. **API interfaces** — camelCase for frontend. NUMERIC columns become `number` (via parseFloat). Null arrays become `[]`.
4. **Input interfaces** — camelCase, partial fields for create/update payloads.

```typescript
// Constants
export const CATEGORIES = ['programming', 'other'] as const

// DB row (snake_case)
export interface FooRow {
  id: number
  some_field: string
  amount: string          // NUMERIC comes as string from pg
  tags: string[] | null
  created_at: string      // always string, never Date
}

// API response (camelCase)
export interface Foo {
  id: number
  someField: string
  amount: number           // parseFloat applied
  tags: string[]           // null → []
  createdAt: string
}

// Create/update input
export interface FooInput {
  someField: string
  amount: number
  tags?: string[]
}
```

### `validate.ts`

Returns `{ data?, error? }`. The caller throws the error:

```typescript
export function validateFooInput(body: any): { data?: FooInput; error?: string } {
  if (!body.someField || typeof body.someField !== 'string') {
    return { error: 'someField is required' }
  }
  return { data: { someField: body.someField.trim() } }
}
```

Usage in API route:
```typescript
const { data, error } = validateFooInput(body)
if (error || !data) throw createError({ statusCode: 400, statusMessage: error })
```

### `transform.ts`

Converts DB rows to API responses:

```typescript
export function toFoo(row: FooRow): Foo {
  return {
    id: row.id,
    someField: row.some_field,
    amount: parseFloat(row.amount),
    tags: row.tags ?? [],
    createdAt: row.created_at,
  }
}
```

---

## Optional Files

| File | When needed |
|------|-------------|
| `hash.ts` | Deduplication via SHA256 content hash |
| `embed.ts` | Building embed text + calling `upsertDocument()` |
| `ingest.ts` | Background processing pipeline (uses `agent_runs` table) |
| `pdf-extract.ts` | Domain-specific file parsing |

---

## Existing Modules

| Module | Files | Notes |
|--------|-------|-------|
| [log](./log.md) | types, validate, transform, entry-config | Journal entries with mood tracking |
| [kanban](./kanban.md) | types, validate, transform | Boards, columns, cards with drag ordering |
| [knowledge](./knowledge.md) | types, validate, transform, hash, embed, ingest | Knowledge base with AI ingest from Claude exports |
| [chat](./chat.md) | types, validate, transform, rag, context | Multi-provider chat with RAG context injection |
| [profile](./profile.md) | types, validate, transform, embed | Personal profile with sections |
| [finances](./finances.md) | types, validate, transform, hash, pdf-extract, ingest | Bank statement import with AI parsing |
