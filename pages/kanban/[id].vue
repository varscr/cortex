<template>
  <div class="-mx-4 md:-mx-8 -mt-2 flex flex-col" style="height: calc(100vh - 4rem);">
    <!-- Header -->
    <div class="px-4 md:px-8 py-3 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
      <ButtonsIcon icon="i-heroicons-arrow-left" size="sm" @click="navigateTo('/kanban')" />
      <h2 class="text-lg font-semibold text-white truncate flex-1">{{ board?.name }}</h2>
      <ButtonsPrimary
        label="Manage Columns"
        icon="i-heroicons-view-columns"
        variant="secondary"
        size="sm"
        class="hidden sm:flex"
        @click="showManageColumns = true"
      />
      <ButtonsIcon icon="i-heroicons-pencil" size="sm" @click="openEdit" />
      <ButtonsIcon icon="i-heroicons-trash" size="sm" variant="danger" @click="showDeleteModal = true" />
    </div>

    <!-- Board -->
    <KanbanBoard />

    <!-- Manage columns modal -->
    <KanbanManageColumnsModal v-model="showManageColumns" />

    <!-- Slide-over backdrop -->
    <Transition name="fade">
      <div
        v-if="isPanelOpen"
        class="fixed inset-0 bg-zinc-950/50 z-30"
        @click="closePanel"
      />
    </Transition>

    <!-- Card panel -->
    <KanbanCardPanel />

    <!-- Edit board modal -->
    <ModalsForm
      v-model="showEditModal"
      title="Edit Board"
      submit-label="Save"
      :loading="saving"
      @submit="handleEdit"
    >
      <div class="space-y-4">
        <div>
          <label class="text-xs text-zinc-500 block mb-1">Name</label>
          <input
            v-model="editForm.name"
            class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
          />
        </div>
        <div>
          <label class="text-xs text-zinc-500 block mb-1">Description</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none resize-none"
          />
        </div>
      </div>
    </ModalsForm>

    <!-- Delete board confirm -->
    <ModalsConfirm
      v-model="showDeleteModal"
      title="Delete Board"
      :message="`Delete '${board?.name}' and all its contents?`"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { board, isPanelOpen, closePanel } = useKanbanState()
const { fetchBoard, updateBoard, deleteBoard } = useKanbanApi()
const toast = useToast()

const boardId = computed(() => Number(route.params.id))

const { data } = await useFetch(`/api/kanban/${route.params.id}`)
if (data.value) {
  board.value = data.value as any
}

const showManageColumns = ref(false)
const showEditModal = ref(false)
const saving = ref(false)
const showDeleteModal = ref(false)
const editForm = reactive({ name: '', description: '' })

function openEdit() {
  if (!board.value) return
  editForm.name = board.value.name
  editForm.description = board.value.description || ''
  showEditModal.value = true
}

async function handleEdit() {
  if (!board.value || !editForm.name.trim()) return
  saving.value = true
  try {
    await updateBoard(board.value.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim() || null,
    })
    board.value.name = editForm.name.trim()
    board.value.description = editForm.description.trim() || null
    showEditModal.value = false
    toast.add({ title: 'Board updated', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to update board', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!board.value) return
  try {
    await deleteBoard(board.value.id)
    toast.add({ title: 'Board deleted', color: 'green' })
    navigateTo('/kanban')
  } catch {
    toast.add({ title: 'Failed to delete board', color: 'red' })
  }
}

onUnmounted(() => {
  board.value = null
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
