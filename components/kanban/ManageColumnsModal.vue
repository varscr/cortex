<template>
  <ModalsForm
    v-model="modelValue"
    title="Manage Columns"
    submit-label="Save"
    @submit="save"
  >
    <div v-if="board" class="space-y-4">
      <draggable
        v-model="localColumns"
        item-key="id"
        handle=".col-drag-handle"
        class="space-y-2"
      >
        <template #item="{ element: col, index }">
          <div class="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
            <UIcon
              name="i-heroicons-bars-6"
              class="w-4 h-4 text-zinc-600 cursor-grab col-drag-handle hover:text-zinc-400 transition-colors"
            />
            
            <!-- Color picker inline -->
            <div class="relative group">
              <button
                type="button"
                class="w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center"
                :class="!col.color ? 'border-white/20 bg-white/5' : 'border-transparent'"
                :style="col.color ? { backgroundColor: col.color } : {}"
              >
                <UIcon v-if="!col.color" name="i-heroicons-paint-brush" class="w-3 h-3 text-zinc-500" />
              </button>
              <div class="absolute left-0 top-full mt-1 hidden group-hover:flex flex-wrap gap-1 p-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 w-32">
                 <button
                  type="button"
                  class="w-4 h-4 rounded-full border border-white/20 hover:border-white"
                  @click="col.color = null"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3 text-zinc-500 block mx-auto" />
                </button>
                <button
                  v-for="c in colorPresets"
                  :key="c"
                  type="button"
                  class="w-4 h-4 rounded-full border border-transparent hover:border-white"
                  :style="{ backgroundColor: c }"
                  @click="col.color = c"
                />
              </div>
            </div>

            <input
              v-model="col.name"
              class="flex-1 text-sm bg-transparent text-white placeholder-zinc-600 px-2 py-1 border-b border-transparent focus:border-white/20 outline-none"
              placeholder="Column name"
            />
            
            <ButtonsIcon
              icon="i-heroicons-trash"
              size="sm"
              variant="danger"
              @click="confirmDelete(col, index)"
            />
          </div>
        </template>
      </draggable>

      <!-- Adding new column directly from here -->
      <form @submit.prevent="addNewColumn" class="flex gap-2 p-2 rounded-lg border border-dashed border-white/20">
        <input
          v-model="newColumnName"
          class="flex-1 text-sm bg-transparent text-white placeholder-zinc-500 px-2 py-1 outline-none"
          placeholder="New column name..."
        />
        <ButtonsPrimary type="submit" label="Add" size="sm" :disabled="!newColumnName.trim()" />
      </form>
    </div>

    <!-- Confirm internal delete -->
    <ModalsConfirm
      v-model="showConfirm"
      title="Delete Column"
      message="Delete this column and all its cards? This will happen immediately."
      @confirm="handleDelete"
    />
  </ModalsForm>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { KanbanColumnDetail } from '~/composables/kanban/types'

const modelValue = defineModel<boolean>({ required: true })

const { board, addColumnToState, removeColumnFromState, updateColumnInState } = useKanbanState()
const { createColumn, deleteColumn, updateColumn, reorderColumns } = useKanbanApi()
const toast = useToast()

const colorPresets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

const localColumns = ref<KanbanColumnDetail[]>([])
const newColumnName = ref('')

const showConfirm = ref(false)
const colToDelete = ref<{ col: KanbanColumnDetail, index: number } | null>(null)

// Sync local with board when modal opens
watch(modelValue, (val) => {
  if (val && board.value) {
    localColumns.value = board.value.columns.map(c => ({ ...c }))
  }
})

async function addNewColumn() {
  if (!newColumnName.value.trim() || !board.value) return
  try {
    const col = await createColumn(board.value.id, {
      name: newColumnName.value.trim(),
      color: null,
    })
    const detail: KanbanColumnDetail = { ...col, cards: [] }
    addColumnToState(detail)
    localColumns.value.push(detail)
    newColumnName.value = ''
  } catch {
    toast.add({ title: 'Failed to create column', color: 'red' })
  }
}

function confirmDelete(col: KanbanColumnDetail, index: number) {
  colToDelete.value = { col, index }
  showConfirm.value = true
}

async function handleDelete() {
  if (!colToDelete.value) return
  const { col, index } = colToDelete.value
  showConfirm.value = false
  try {
    await deleteColumn(col.id)
    removeColumnFromState(col.id)
    localColumns.value.splice(index, 1)
    toast.add({ title: 'Column deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete column', color: 'red' })
  }
}

async function save() {
  if (!board.value) return
  
  try {
    // 1. Handle reorder if changed
    const originalIds = board.value.columns.map(c => c.id)
    const newIds = localColumns.value.map(c => c.id)
    const orderChanged = originalIds.join(',') !== newIds.join(',')
    
    if (orderChanged) {
      await reorderColumns(board.value.id, newIds)
      // Sync board state order
      const newCols = localColumns.value.map(lc => {
         const oc = board.value!.columns.find(c => c.id === lc.id)
         return oc ? { ...oc, name: lc.name, color: lc.color } : lc
      })
      board.value.columns = newCols
    }

    // 2. Handle updates (names/colors)
    for (const lc of localColumns.value) {
      const oc = board.value.columns.find(c => c.id === lc.id)
      if (oc && (oc.name !== lc.name || oc.color !== lc.color)) {
         await updateColumn(lc.id, { name: lc.name, color: lc.color })
         updateColumnInState(lc.id, { name: lc.name, color: lc.color })
      }
    }
    
    toast.add({ title: 'Columns updated', color: 'green' })
    modelValue.value = false
  } catch {
    toast.add({ title: 'Failed to update columns', color: 'red' })
  }
}
</script>