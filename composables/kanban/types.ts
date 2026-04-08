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
  collapsed?: boolean
}

export interface KanbanTask {
  id: string
  name: string
  finished: boolean
}

export interface KanbanCard {
  id: number
  columnId: number
  title: string
  description: string | null
  tags: string[]
  position: number
  dueDate: string | null
  color: string | null
  tasks: KanbanTask[]
  createdAt: string
  updatedAt: string
}

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
  color?: string | null
  tasks?: KanbanTask[]
}
