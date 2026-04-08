import type { KanbanBoardRow, KanbanBoard, KanbanColumnRow, KanbanColumn, KanbanCardRow, KanbanCard } from './types'

export function toKanbanBoard(row: KanbanBoardRow): KanbanBoard {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toKanbanColumn(row: KanbanColumnRow): KanbanColumn {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    position: row.position,
    color: row.color,
    createdAt: row.created_at,
  }
}

export function toKanbanCard(row: KanbanCardRow): KanbanCard {
  const tasks = typeof row.tasks === 'string' ? JSON.parse(row.tasks) : (row.tasks ?? [])
  return {
    id: row.id,
    columnId: row.column_id,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    position: row.position,
    dueDate: row.due_date,
    color: row.color ?? null,
    tasks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
