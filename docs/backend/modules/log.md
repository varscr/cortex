# Log Module

Personal journal / reflection entries with mood tracking.

## Utils: `server/utils/log/`

| File | Exports |
|------|---------|
| `types.ts` | `MOODS`, `ENTRY_TYPES`, `LogEntryRow`, `LogEntry`, `LogEntryInput` |
| `validate.ts` | `validateLogInput(body)` |
| `transform.ts` | `toLogEntry(row)` |
| `entry-config.ts` | Mood/type icon and color mappings |

## API: `server/api/log/`

Standard CRUD with filters: `mood`, `entry_type`, `tags`, `search`, `dateFrom`/`dateTo`, `isPinned`.

## Schema

Table: `log_entries` in `db/init/01-core.sql`

Fields: id, title, content, tags (TEXT[]), mood, entry_type, is_pinned, date, created_at, updated_at
