<template>
  <!-- Color bar -->
  <div
    v-if="selectedCard.color"
    class="h-2 flex-shrink-0"
    :style="{ backgroundColor: selectedCard.color }"
  />

  <!-- Header -->
  <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
    <h3 class="text-lg font-semibold text-white truncate pr-4">
      {{ editing ? 'Edit Card' : selectedCard.title }}
    </h3>
    <div class="flex items-center gap-1">
      <ButtonsIcon v-if="!editing" icon="i-heroicons-pencil" size="sm" @click="startEdit" />
      <ButtonsIcon icon="i-heroicons-x-mark" size="sm" @click="closePanel" />
    </div>
  </div>

  <!-- View mode -->
  <div v-if="!editing" class="p-6 space-y-5 flex-1 overflow-y-auto">
    <div>
      <p v-if="selectedCard.description" class="text-sm text-zinc-300 whitespace-pre-wrap">{{ selectedCard.description }}</p>
      <p v-else class="text-sm text-zinc-600 italic">No description</p>
    </div>

    <div v-if="selectedCard.tags.length">
      <p class="text-xs text-zinc-500 mb-2">Tags</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in selectedCard.tags"
          :key="tag"
          class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div v-if="selectedCard.dueDate" class="flex items-center gap-2 text-sm text-zinc-400">
      <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
      {{ formatDate(selectedCard.dueDate) }}
    </div>

    <div v-if="selectedCard.tasks.length">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-zinc-500">Tasks</p>
        <span class="text-xs text-zinc-500">{{ tasksDone }}/{{ selectedCard.tasks.length }}</span>
      </div>
      <div class="h-1 rounded-full bg-white/5 overflow-hidden mb-3">
        <div
          class="h-full rounded-full transition-all"
          :class="tasksDone === selectedCard.tasks.length ? 'bg-emerald-400' : 'bg-zinc-400'"
          :style="{ width: `${tasksProgress}%` }"
        />
      </div>
      <div class="space-y-1">
        <div
          v-for="task in selectedCard.tasks"
          :key="task.id"
          class="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer"
          @click="toggleTask(task)"
        >
          <div
            class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
            :class="task.finished ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'"
          >
            <UIcon v-if="task.finished" name="i-heroicons-check" class="w-3 h-3 text-white" />
          </div>
          <span class="text-sm" :class="task.finished ? 'text-zinc-500 line-through' : 'text-zinc-300'">
            {{ task.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t border-white/5 text-xs text-zinc-600">
      Created {{ formatDate(selectedCard.createdAt) }}
    </div>
  </div>

  <!-- Edit mode -->
  <form v-else @submit.prevent="save" class="p-6 space-y-4 flex-1 overflow-y-auto">
    <div>
      <label class="text-xs text-zinc-500 block mb-1">Title</label>
      <input
        v-model="form.title"
        class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
      />
    </div>

    <div>
      <label class="text-xs text-zinc-500 block mb-1">Description</label>
      <textarea
        v-model="form.description"
        rows="5"
        class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none resize-none"
        placeholder="Add a description..."
      />
    </div>

    <div>
      <label class="text-xs text-zinc-500 block mb-1">Color</label>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-6 h-6 rounded-full border-2 transition-colors"
          :class="!form.color ? 'border-white bg-white/5' : 'border-transparent'"
          @click="form.color = null"
        >
          <UIcon v-if="!form.color" name="i-heroicons-x-mark" class="w-4 h-4 text-zinc-500 block mx-auto" />
        </button>
        <button
          v-for="c in colorPresets"
          :key="c"
          type="button"
          class="w-6 h-6 rounded-full border-2 transition-colors"
          :class="form.color === c ? 'border-white' : 'border-transparent'"
          :style="{ backgroundColor: c }"
          @click="form.color = c"
        />
      </div>
    </div>

    <div>
      <label class="text-xs text-zinc-500 block mb-1">Tags</label>
      <div class="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
        <FormsTagInput v-model="form.tags" />
      </div>
    </div>

    <div>
      <label class="text-xs text-zinc-500 block mb-1">Due date</label>
      <input
        v-model="form.dueDate"
        type="date"
        class="text-sm bg-white/5 text-zinc-300 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
      />
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs text-zinc-500">Tasks</label>
        <button
          v-if="form.tasks.some(t => t.finished)"
          type="button"
          class="text-xs text-red-400 hover:text-red-300 transition-colors"
          @click="form.tasks = form.tasks.filter(t => !t.finished)"
        >
          Clear completed
        </button>
      </div>
      <draggable v-model="form.tasks" item-key="id" handle=".drag-handle" class="space-y-1.5">
        <template #item="{ element: task, index: i }">
          <div class="flex items-center gap-2 group">
            <UIcon name="i-heroicons-bars-6" class="w-4 h-4 text-zinc-600 cursor-grab drag-handle hover:text-zinc-400 transition-colors" />
            <button
              type="button"
              class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
              :class="task.finished ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'"
              @click="task.finished = !task.finished"
            >
              <UIcon v-if="task.finished" name="i-heroicons-check" class="w-3 h-3 text-white" />
            </button>
            <input
              v-model="task.name"
              class="flex-1 text-sm bg-white/5 text-zinc-300 rounded px-2 py-1 border border-white/5 focus:border-white/10 outline-none"
              @keydown.enter.prevent="addTask"
            />
            <ButtonsIcon
              icon="i-heroicons-x-mark"
              size="sm"
              variant="danger"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="form.tasks.splice(i, 1)"
            />
          </div>
        </template>
      </draggable>
      <button
        type="button"
        class="mt-2 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        @click="addTask"
      >
        <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
        Add task
      </button>
    </div>

    <div class="flex justify-between pt-2">
      <ButtonsDanger label="Delete" size="sm" @click="showDelete = true" />
      <div class="flex gap-2">
        <ButtonsPrimary label="Cancel" variant="secondary" size="sm" @click="editing = false" />
        <ButtonsPrimary type="submit" label="Save" size="sm" :loading="saving" />
      </div>
    </div>
  </form>

  <ModalsConfirm
    v-model="showDelete"
    title="Delete Card"
    message="This card will be permanently deleted."
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { KanbanTask } from '~/composables/kanban/types'

const { selectedCard, closePanel, updateCardInState, removeCardFromState } = useKanbanState()
const { updateCard, deleteCard } = useKanbanApi()
const toast = useToast()

const colorPresets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const editing = ref(false)
const saving = ref(false)
const showDelete = ref(false)

const form = reactive({
  title: '',
  description: '',
  tags: [] as string[],
  dueDate: '',
  color: null as string | null,
  tasks: [] as KanbanTask[],
})

const tasksDone = computed(() => selectedCard.value?.tasks.filter(t => t.finished).length ?? 0)
const tasksProgress = computed(() => {
  if (!selectedCard.value?.tasks.length) return 0
  return Math.round((tasksDone.value / selectedCard.value.tasks.length) * 100)
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function startEdit() {
  if (!selectedCard.value) return
  form.title = selectedCard.value.title
  form.description = selectedCard.value.description || ''
  form.tags = [...selectedCard.value.tags]
  form.dueDate = selectedCard.value.dueDate || ''
  form.color = selectedCard.value.color
  form.tasks = selectedCard.value.tasks.map(t => ({ ...t }))
  editing.value = true
}

function addTask() {
  form.tasks.push({ id: crypto.randomUUID(), name: '', finished: false })
}

async function toggleTask(task: KanbanTask) {
  if (!selectedCard.value) return
  const updatedTasks = selectedCard.value.tasks.map(t =>
    t.id === task.id ? { ...t, finished: !t.finished } : { ...t }
  )
  try {
    const updated = await updateCard(selectedCard.value.id, {
      title: selectedCard.value.title,
      description: selectedCard.value.description,
      tags: selectedCard.value.tags,
      dueDate: selectedCard.value.dueDate,
      color: selectedCard.value.color,
      tasks: updatedTasks,
    })
    updateCardInState(updated)
  } catch {
    toast.add({ title: 'Failed to update task', color: 'red' })
  }
}

async function save() {
  if (!selectedCard.value || !form.title.trim()) return
  saving.value = true
  try {
    const updated = await updateCard(selectedCard.value.id, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      tags: form.tags,
      dueDate: form.dueDate || null,
      color: form.color,
      tasks: form.tasks.filter(t => t.name.trim()),
    })
    updateCardInState(updated)
    editing.value = false
    toast.add({ title: 'Card updated', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to update card', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!selectedCard.value) return
  showDelete.value = false
  try {
    await deleteCard(selectedCard.value.id)
    removeCardFromState(selectedCard.value.id)
    closePanel()
    toast.add({ title: 'Card deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete card', color: 'red' })
  }
}

watch(selectedCard, () => { editing.value = false })
</script>
