// Database row types (snake_case)
export interface KanbanBoardRow {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface KanbanColumnRow {
  id: number
  board_id: number
  name: string
  position: number
  color: string | null
  created_at: string
}

export interface KanbanCardRow {
  id: number
  column_id: number
  title: string
  description: string | null
  tags: string[] | null
  position: number
  due_date: string | null
  created_at: string
  updated_at: string
}

// API types (camelCase)
export interface KanbanBoard {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface KanbanBoardDetail extends KanbanBoard {
  columns: KanbanColumnDetail[]
}

export interface KanbanColumn {
  id: number
  boardId: number
  name: string
  position: number
  color: string | null
  createdAt: string
}

export interface KanbanColumnDetail extends KanbanColumn {
  cards: KanbanCard[]
}

export interface KanbanCard {
  id: number
  columnId: number
  title: string
  description: string | null
  tags: string[]
  position: number
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

// Input types
export interface BoardInput {
  name: string
  description?: string | null
}

export interface ColumnInput {
  name: string
  color?: string | null
}

export interface CardInput {
  title: string
  description?: string | null
  tags?: string[]
  dueDate?: string | null
}

export interface CardMoveInput {
  cardId: number
  targetColumnId: number
  position: number
}

export interface ReorderInput {
  orderedIds: number[]
}
