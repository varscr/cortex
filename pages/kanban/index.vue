<template>
  <div>
    <UiPageHeader title="Kanban" description="Organize tasks across boards.">
      <template #actions>
        <ButtonsPrimary
          label="New Board"
          icon="i-heroicons-plus"
          @click="openCreate"
        />
      </template>
    </UiPageHeader>

    <!-- Board grid -->
    <div v-if="boards.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KanbanBoardCard
        v-for="board in boards"
        :key="board.id"
        :board="board"
        @edit="openEdit"
        @delete="confirmDelete"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!pending" class="linear-panel rounded-xl p-12 text-center">
      <UIcon name="i-heroicons-view-columns" class="w-12 h-12 text-zinc-600 mx-auto mb-4" />
      <p class="text-zinc-400 mb-4">No boards yet</p>
      <ButtonsPrimary label="Create your first board" icon="i-heroicons-plus" @click="openCreate" />
    </div>

    <!-- Create / Edit modal -->
    <ModalsForm
      v-model="showModal"
      :title="editingBoard ? 'Edit Board' : 'New Board'"
      :submit-label="editingBoard ? 'Save' : 'Create'"
      :loading="saving"
      @submit="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="text-xs text-zinc-500 block mb-1">Name</label>
          <input
            v-model="form.name"
            placeholder="Board name"
            class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
          />
        </div>
        <div>
          <label class="text-xs text-zinc-500 block mb-1">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Optional description..."
            rows="3"
            class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none resize-none"
          />
        </div>
      </div>
    </ModalsForm>

    <!-- Delete confirm -->
    <ModalsConfirm
      v-model="showDeleteModal"
      title="Delete Board"
      :message="`Delete '${deletingBoard?.name}' and all its columns and cards?`"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { KanbanBoard } from '~/composables/kanban/types'

const { createBoard, updateBoard, deleteBoard } = useKanbanApi()
const toast = useToast()

const { data, pending, refresh } = await useFetch<KanbanBoard[]>('/api/kanban')
const boards = computed(() => data.value ?? [])

const showModal = ref(false)
const saving = ref(false)
const editingBoard = ref<KanbanBoard | null>(null)
const form = reactive({ name: '', description: '' })

const showDeleteModal = ref(false)
const deleting = ref(false)
const deletingBoard = ref<KanbanBoard | null>(null)

function openCreate() {
  editingBoard.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEdit(board: KanbanBoard) {
  editingBoard.value = board
  form.name = board.name
  form.description = board.description || ''
  showModal.value = true
}

function confirmDelete(board: KanbanBoard) {
  deletingBoard.value = board
  showDeleteModal.value = true
}

async function handleSubmit() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    }
    if (editingBoard.value) {
      await updateBoard(editingBoard.value.id, body)
      toast.add({ title: 'Board updated', color: 'green' })
    } else {
      await createBoard(body)
      toast.add({ title: 'Board created', color: 'green' })
    }
    showModal.value = false
    await refresh()
  } catch {
    toast.add({ title: 'Failed to save board', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!deletingBoard.value) return
  deleting.value = true
  try {
    await deleteBoard(deletingBoard.value.id)
    showDeleteModal.value = false
    toast.add({ title: 'Board deleted', color: 'green' })
    await refresh()
  } catch {
    toast.add({ title: 'Failed to delete board', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
