# Kanban Module

Task boards with columns and draggable cards.

## Utils: `server/utils/kanban/`

| File | Exports |
|------|---------|
| `types.ts` | Row/API/Input types for Board, Column, Card + move/reorder inputs |
| `validate.ts` | `validateBoardInput`, `validateColumnInput`, `validateCardInput`, `validateCardMove`, `validateReorder` |
| `transform.ts` | `toKanbanBoard`, `toKanbanColumn`, `toKanbanCard` |

## API: `server/api/kanban/`

- Boards: CRUD
- Columns: CRUD nested under boards
- Cards: CRUD with position-based ordering, move between columns via transactions

## Schema

Tables: `kanban_boards`, `kanban_columns`, `kanban_cards` in `db/init/01-core.sql`

Card moves use transactions (BEGIN/COMMIT) to reorder positions atomically.
