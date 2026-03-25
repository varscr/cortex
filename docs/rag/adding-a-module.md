# Adding RAG to a New Module

This guide walks through adding semantic search support to any new Cortex module. It takes about 15 minutes and requires touching 4 files.

---

## Prerequisites

- Module has a DB table with an integer primary key
- Module has a `*-types.ts` file with a `Row` type (snake_case fields)
- Module has API routes for create (`index.post.ts`), update (`[id].put.ts`), delete (`[id].delete.ts`)

---

## Step 1 — Create `server/utils/<module>-embed.ts`

This file has one job: convert a DB row into a text string that will be embedded.

```typescript
// server/utils/tasks-embed.ts

function buildTaskText(row: TaskRow): string {
  let text = `Task [${row.status}]: ${row.title}`
  if (row.description) text += `\nDescription: ${row.description}`
  if (row.due_date) text += `\nDue: ${row.due_date}`
  if (row.tags?.length) text += `\nTags: ${row.tags.join(', ')}`
  return text
}

export async function upsertTaskEmbedding(row: TaskRow): Promise<void> {
  await upsertDocument(`tasks/${row.id}`, 'tasks', buildTaskText(row), {
    title: row.title,
    status: row.status,
    dueDate: row.due_date,
  })
}

export async function deleteTaskEmbedding(id: number): Promise<void> {
  await deleteDocument(`tasks/${id}`)
}
```

**Key rules for `buildTaskText`:**

- Start with the most descriptive field (title, name, role)
- Include a type label in brackets if useful: `[status]`, `[category]`
- Join arrays with `, ` — never emit `null` as text, skip null fields
- Use natural prose labels (`Tech stack:` not `tech_stack=`)
- Omit URLs, IDs, image paths — they carry no semantic signal

**Key rules for `source` and `source_type`:**

- `source`: `'<module>/<id>'` — unique identifier for this document
- `source_type`: `'<module>'` — used to filter search results by module
- `metadata`: include display-friendly fields (title, status, dates) that the search UI will show

### Profile-style modules (multiple entity types in one module)

If your module has multiple sub-types (like profile has experience, skills, projects), use:
- `source_type = '<module>'` for all of them
- `source = '<module>/<section>/<id>'`
- `metadata.section = '<section>'` to distinguish within the module

This lets `sourceTypes: ['profile']` retrieve everything about the person in one query.

---

## Step 2 — Hook into API routes

After every `RETURNING *` query, add a fire-and-forget call. Do NOT await it.

**POST (create) — `server/api/tasks/index.post.ts`:**

```typescript
const result = await db.query(
  `INSERT INTO tasks (...) VALUES (...) RETURNING *`,
  [...]
)

upsertTaskEmbedding(result.rows[0])            // ← add this
  .catch(err => console.error('[embed] failed for tasks', result.rows[0].id, err))

setResponseStatus(event, 201)
return toTask(result.rows[0])
```

**PUT (update) — `server/api/tasks/[id].put.ts`:**

```typescript
const result = await db.query(
  `UPDATE tasks SET ... WHERE id = $n RETURNING *`,
  [...]
)

if (result.rows.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Task not found' })
}

upsertTaskEmbedding(result.rows[0])            // ← add this
  .catch(err => console.error('[embed] failed for tasks', result.rows[0].id, err))

return toTask(result.rows[0])
```

**DELETE — `server/api/tasks/[id].delete.ts`:**

```typescript
const result = await db.query(
  'DELETE FROM tasks WHERE id = $1 RETURNING id',
  [id]
)

if (result.rows.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Task not found' })
}

deleteTaskEmbedding(parseInt(id!))             // ← add this
  .catch(err => console.error('[embed] delete failed for tasks', id, err))

return { deleted: true }
```

**Note:** No imports needed — `upsertDocument`, `deleteDocument`, and your embed functions are all auto-imported by Nuxt from `server/utils/`.

---

## Step 3 — Test

**Check documents are being written:**

```bash
sudo docker compose exec postgres psql -U cortex -d cortex_db \
  -c "SELECT source, source_type, content FROM documents WHERE source_type = 'tasks';"
```

After creating a task via the API, you should see a row appear here (give it a second — it's async).

**Test search:**

```
GET /api/search?q=finish the deployment pipeline&sourceTypes=tasks
```

Expected response:
```json
{
  "results": [
    {
      "source": "tasks/7",
      "sourceType": "tasks",
      "content": "Task [in_progress]: Set up CI/CD pipeline\nDescription: ...",
      "metadata": { "title": "Set up CI/CD pipeline", "status": "in_progress" },
      "similarity": 0.84
    }
  ],
  "total": 1,
  "query": "finish the deployment pipeline"
}
```

If results are empty, check:
1. `OPENAI_API_KEY` is set in `.env`
2. The task was created/updated after you added the embed hook
3. There are no `[embed] failed` errors in `sudo docker compose logs cortex`

---

## Checklist

- [ ] `server/utils/<module>-embed.ts` created
- [ ] `buildText` produces natural-language prose (not raw key-value)
- [ ] `source` follows `<module>/<id>` convention
- [ ] `source_type` is the module name (lowercase, no spaces)
- [ ] `metadata` includes fields needed to display the result (title, status, date)
- [ ] Fire-and-forget added to POST route
- [ ] Fire-and-forget added to PUT route
- [ ] Fire-and-forget added to DELETE route
- [ ] `.catch()` error log uses `[embed]` prefix and includes the id
- [ ] Tested: document appears in `documents` table after create
- [ ] Tested: `GET /api/search?q=...&sourceTypes=<module>` returns results
