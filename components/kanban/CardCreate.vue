<template>
  <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
    <h3 class="text-lg font-semibold text-white">New Card</h3>
    <ButtonsIcon icon="i-heroicons-x-mark" size="sm" @click="closeCreate" />
  </div>

  <form @submit.prevent="submit" class="p-6 space-y-4 flex-1 overflow-y-auto">
    <div>
      <label class="text-xs text-zinc-500 block mb-1">Title <span class="text-zinc-600">(required)</span></label>
      <input
        v-model="form.title"
        class="w-full text-sm bg-white/5 text-zinc-300 placeholder-zinc-600 rounded-lg px-3 py-2 border border-white/5 focus:border-white/10 outline-none"
        placeholder="Card title..."
        autofocus
      />
    </div>

    <div>
      <label class="text-xs text-zinc-500 block mb-1">Description</label>
      <textarea
        v-model="form.description"
        rows="4"
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
      <label class="text-xs text-zinc-500 block mb-2">Tasks</label>
      <div class="space-y-1.5">
        <div v-for="(task, i) in form.tasks" :key="task.id" class="flex items-center gap-2 group">
          <button
            type="button"
            class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center border-zinc-600"
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
      </div>
      <button
        type="button"
        class="mt-2 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        @click="addTask"
      >
        <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
        Add task
      </button>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <ButtonsPrimary label="Cancel" variant="secondary" size="sm" @click="closeCreate" />
      <ButtonsPrimary type="submit" label="Create" size="sm" :disabled="!form.title.trim()" :loading="saving" />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { KanbanTask } from '~/composables/kanban/types'

const { creatingColumnId, closeCreate, addCardToState } = useKanbanState()
const { createCard } = useKanbanApi()
const toast = useToast()

const colorPresets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const saving = ref(false)

const form = reactive({
  title: '',
  description: '',
  tags: [] as string[],
  dueDate: '',
  color: null as string | null,
  tasks: [] as KanbanTask[],
})

watch(creatingColumnId, (val) => {
  if (val !== null) {
    form.title = ''
    form.description = ''
    form.tags = []
    form.dueDate = ''
    form.color = null
    form.tasks = []
  }
})

function addTask() {
  form.tasks.push({ id: crypto.randomUUID(), name: '', finished: false })
}

async function submit() {
  if (!form.title.trim() || creatingColumnId.value === null) return
  saving.value = true
  try {
    const card = await createCard(creatingColumnId.value, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      tags: form.tags,
      dueDate: form.dueDate || null,
      color: form.color,
      tasks: form.tasks.filter(t => t.name.trim()),
    })
    addCardToState(creatingColumnId.value, card)
    closeCreate()
    toast.add({ title: 'Card created', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to create card', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
