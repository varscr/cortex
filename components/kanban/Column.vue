<template>
  <div
    class="flex-shrink-0 flex flex-col max-h-full rounded-xl linear-panel transition-all duration-300"
    :class="column.collapsed ? 'w-14' : 'w-72'"
  >
    <!-- Collapsed View -->
    <div
      v-if="column.collapsed"
      class="flex-1 flex flex-col items-center py-4 cursor-pointer hover:bg-white/5 transition-colors"
      @click="toggleColumnCollapse(column.id)"
    >
      <div
        v-if="column.color"
        class="w-3 h-3 rounded-full mb-4 flex-shrink-0"
        :style="{ backgroundColor: column.color }"
      />
      <div class="column-drag-handle flex-1 flex justify-center w-full">
        <span class="text-sm font-medium text-white whitespace-nowrap" style="writing-mode: vertical-rl; transform: rotate(180deg);">
          {{ column.name }}
        </span>
      </div>
      <span class="text-xs text-zinc-500 mt-4">{{ column.cards.length }}</span>
    </div>

    <!-- Expanded View -->
    <template v-else>
      <!-- Header -->
      <div class="px-3 py-2.5 border-b border-white/5 flex items-center gap-2">
        <div
          v-if="column.color"
          class="w-2 h-2 rounded-full flex-shrink-0"
          :style="{ backgroundColor: column.color }"
        />

        <!-- Inline editing -->
        <input
          v-if="editing"
          ref="editRef"
          v-model="editName"
          class="flex-1 text-sm font-medium text-white bg-transparent outline-none border-b border-white/10 w-full min-w-0"
          @keydown.enter="saveEdit"
          @keydown.escape="editing = false"
          @blur="saveEdit"
        />
        <span v-else class="column-drag-handle cursor-grab text-sm font-medium text-white flex-1 truncate">
          {{ column.name }}
        </span>

        <span class="text-xs text-zinc-500 flex-shrink-0">{{ column.cards.length }}</span>

        <ButtonsIcon
          icon="i-heroicons-arrows-right-left"
          size="sm"
          class="flex-shrink-0"
          @click="toggleColumnCollapse(column.id)"
        />

        <div class="relative flex-shrink-0" ref="menuRef">
          <ButtonsIcon icon="i-heroicons-ellipsis-horizontal" size="sm" @click="menuOpen = !menuOpen" />
          <div
            v-if="menuOpen"
            class="absolute right-0 top-7 z-20 w-36 rounded-lg linear-panel border border-white/5 py-1 shadow-xl"
          >
            <button
              class="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
              @click="startEdit"
            >
              Edit
            </button>
            <button
              class="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
              @click="showDelete = true; menuOpen = false"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Cards -->
      <div class="flex-1 overflow-y-auto p-2">
        <draggable
          :list="column.cards"
          item-key="id"
          group="cards"
          :data-column-id="column.id"
          class="space-y-2 min-h-[2rem]"
          @change="onDragChange"
        >
          <template #item="{ element }">
            <KanbanCard :card="element" @select="$emit('selectCard', $event)" />
          </template>
        </draggable>
      </div>

      <!-- New card -->
      <KanbanNewCard :column-id="column.id" />
    </template>

    <!-- Delete confirm -->
    <ModalsConfirm
      v-model="showDelete"
      title="Delete Column"
      :message="`Delete '${column.name}' and all its cards?`"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { KanbanColumnDetail, KanbanCard as KanbanCardType } from '~/composables/kanban/types'

const props = defineProps<{
  column: KanbanColumnDetail
}>()

defineEmits<{
  selectCard: [card: KanbanCardType]
}>()

const { updateColumn, deleteColumn, moveCard } = useKanbanApi()
const { removeColumnFromState, updateColumnInState, toggleColumnCollapse } = useKanbanState()
const toast = useToast()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement>()
const showDelete = ref(false)
const editing = ref(false)
const editName = ref('')
const editRef = ref<HTMLInputElement>()

function startEdit() {
  menuOpen.value = false
  editName.value = props.column.name
  editing.value = true
  nextTick(() => editRef.value?.focus())
}

async function saveEdit() {
  if (!editing.value) return
  editing.value = false
  const trimmed = editName.value.trim()
  if (!trimmed || trimmed === props.column.name) return
  try {
    await updateColumn(props.column.id, { name: trimmed, color: props.column.color })
    updateColumnInState(props.column.id, { name: trimmed, color: props.column.color })
  } catch {
    toast.add({ title: 'Failed to update column', color: 'red' })
  }
}

async function handleDelete() {
  showDelete.value = false
  try {
    await deleteColumn(props.column.id)
    removeColumnFromState(props.column.id)
    toast.add({ title: 'Column deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete column', color: 'red' })
  }
}

async function onDragChange(event: any) {
  if (!event.added) return
  const card = event.added.element as KanbanCardType
  const newIndex = event.added.newIndex as number
  try {
    await moveCard(card.id, props.column.id, newIndex)
  } catch {
    toast.add({ title: 'Failed to move card', color: 'red' })
  }
}

// Close menu on click outside
onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (menuOpen.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
      menuOpen.value = false
    }
  }
  document.addEventListener('click', handler)
  onUnmounted(() => document.removeEventListener('click', handler))
})
</script>
