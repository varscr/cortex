import type { KanbanBoard, KanbanBoardDetail, KanbanColumn, KanbanColumnDetail, KanbanCard, BoardInput, ColumnInput, CardInput } from './types'

export function useKanbanApi() {
  // Boards
  const fetchBoards = () => $fetch<KanbanBoard[]>('/api/kanban')

  const fetchBoard = (id: number) => $fetch<KanbanBoardDetail>(`/api/kanban/${id}`)

  const createBoard = (body: BoardInput) =>
    $fetch<KanbanBoard>('/api/kanban', { method: 'POST', body })

  const updateBoard = (id: number, body: BoardInput) =>
    $fetch<KanbanBoard>(`/api/kanban/${id}`, { method: 'PUT', body })

  const deleteBoard = (id: number) =>
    $fetch<{ deleted: boolean }>(`/api/kanban/${id}`, { method: 'DELETE' })

  // Columns
  const createColumn = (boardId: number, body: ColumnInput) =>
    $fetch<KanbanColumn>(`/api/kanban/${boardId}/columns`, { method: 'POST', body })

  const updateColumn = (id: number, body: ColumnInput) =>
    $fetch<KanbanColumn>(`/api/kanban/columns/${id}`, { method: 'PUT', body })

  const deleteColumn = (id: number) =>
    $fetch<{ deleted: boolean }>(`/api/kanban/columns/${id}`, { method: 'DELETE' })

  const reorderColumns = (boardId: number, orderedIds: number[]) =>
    $fetch<KanbanColumn[]>(`/api/kanban/${boardId}/columns/reorder`, { method: 'PUT', body: { orderedIds } })

  // Cards
  const createCard = (columnId: number, body: CardInput) =>
    $fetch<KanbanCard>(`/api/kanban/columns/${columnId}/cards`, { method: 'POST', body })

  const updateCard = (id: number, body: CardInput) =>
    $fetch<KanbanCard>(`/api/kanban/cards/${id}`, { method: 'PUT', body })

  const deleteCard = (id: number) =>
    $fetch<{ deleted: boolean }>(`/api/kanban/cards/${id}`, { method: 'DELETE' })

  const moveCard = (cardId: number, targetColumnId: number, position: number) =>
    $fetch<KanbanCard>('/api/kanban/cards/move', { method: 'PUT', body: { cardId, targetColumnId, position } })

  return {
    fetchBoards, fetchBoard, createBoard, updateBoard, deleteBoard,
    createColumn, updateColumn, deleteColumn, reorderColumns,
    createCard, updateCard, deleteCard, moveCard,
  }
}
