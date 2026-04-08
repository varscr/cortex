import type { KanbanBoardDetail, KanbanColumnDetail, KanbanCard } from './types'

export function useKanbanState() {
  const board = useState<KanbanBoardDetail | null>('kanban-board', () => null)
  const selectedCard = useState<KanbanCard | null>('kanban-selected-card', () => null)
  const creatingColumnId = useState<number | null>('kanban-creating-column', () => null)
  const isPanelOpen = computed(() => selectedCard.value !== null || creatingColumnId.value !== null)

  function selectCard(card: KanbanCard) {
    creatingColumnId.value = null
    selectedCard.value = { ...card }
  }

  function closePanel() {
    selectedCard.value = null
  }

  function openCreate(columnId: number) {
    selectedCard.value = null
    creatingColumnId.value = columnId
  }

  function closeCreate() {
    creatingColumnId.value = null
  }

  function updateCardInState(updated: KanbanCard) {
    if (!board.value) return
    for (const col of board.value.columns) {
      const idx = col.cards.findIndex(c => c.id === updated.id)
      if (idx !== -1) {
        col.cards[idx] = updated
        break
      }
    }
    if (selectedCard.value?.id === updated.id) {
      selectedCard.value = { ...updated }
    }
  }

  function removeCardFromState(cardId: number) {
    if (!board.value) return
    for (const col of board.value.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId)
      if (idx !== -1) {
        col.cards.splice(idx, 1)
        break
      }
    }
  }

  function addCardToState(columnId: number, card: KanbanCard) {
    if (!board.value) return
    const col = board.value.columns.find(c => c.id === columnId)
    if (col) col.cards.push(card)
  }

  function addColumnToState(column: KanbanColumnDetail) {
    if (!board.value) return
    board.value.columns.push(column)
  }

  function removeColumnFromState(columnId: number) {
    if (!board.value) return
    const idx = board.value.columns.findIndex(c => c.id === columnId)
    if (idx !== -1) board.value.columns.splice(idx, 1)
  }

  function updateColumnInState(id: number, data: { name: string; color: string | null }) {
    if (!board.value) return
    const col = board.value.columns.find(c => c.id === id)
    if (col) {
      col.name = data.name
      col.color = data.color
    }
  }

  function toggleColumnCollapse(id: number) {
    if (!board.value) return
    const col = board.value.columns.find(c => c.id === id)
    if (col) {
      col.collapsed = !col.collapsed
    }
  }

  return {
    board, selectedCard, creatingColumnId, isPanelOpen,
    selectCard, closePanel, openCreate, closeCreate,
    updateCardInState, removeCardFromState, addCardToState,
    addColumnToState, removeColumnFromState, updateColumnInState,
    toggleColumnCollapse,
  }
}
