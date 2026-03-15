<template>
  <UiCard title="Goals">
    <template #actions>
      <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="goals.length" class="space-y-4">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="p-4 rounded-lg border border-white/5 bg-white/[0.02] group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white">{{ goal.title }}</h4>
              <span
                class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                :class="goalStatusClass(goal.status)"
              >{{ goalStatusLabel(goal.status) }}</span>
              <span v-if="goal.category" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-800 text-zinc-400">{{ goal.category }}</span>
            </div>
            <p v-if="goal.description" class="text-sm text-zinc-400 mt-1">{{ goal.description }}</p>
            <p v-if="goal.targetDate" class="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <UIcon name="i-heroicons-calendar" class="w-3 h-3" /> {{ formatDate(goal.targetDate) }}
            </p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(goal)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'goal', goal.id, goal.title)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No goals added yet.</p>
  </UiCard>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Goal' : 'Add Goal'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.title"
      placeholder="Goal title"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <textarea
      v-model="form.description"
      placeholder="Description (optional)"
      rows="3"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Status</label>
      <select
        v-model="form.status"
        class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
      >
        <option value="not_started">Not Started</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Target date (optional)</label>
      <input
        v-model="form.targetDate"
        type="date"
        class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
      />
    </div>
    <input
      v-model="form.category"
      placeholder="Category (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
  </UiFormModal>
</template>

<script setup lang="ts">
import type { Goal } from '~/server/utils/profile-types'
import { formatDate } from '~/composables/useFormatDate'

const props = defineProps<{ goals: Goal[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Goal | null>(null)
const form = reactive({ title: '', description: '', status: 'not_started', targetDate: '', category: '' })

function goalStatusClass(status: string): string {
  const classes: Record<string, string> = {
    in_progress: 'bg-blue-500/10 text-blue-400',
    completed: 'bg-green-500/10 text-green-400',
    not_started: 'bg-zinc-700/50 text-zinc-400',
  }
  return classes[status] ?? classes.not_started
}

function goalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    not_started: 'Not Started',
  }
  return labels[status] ?? status
}

function openModal(goal?: Goal) {
  if (goal) {
    editing.value = goal
    form.title = goal.title
    form.description = goal.description ?? ''
    form.status = goal.status
    form.targetDate = goal.targetDate ?? ''
    form.category = goal.category ?? ''
  } else {
    editing.value = null
    form.title = ''
    form.description = ''
    form.status = 'not_started'
    form.targetDate = ''
    form.category = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      ...form,
      description: form.description || null,
      targetDate: form.targetDate || null,
      category: form.category || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/goals/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Goal updated', color: 'green' })
    } else {
      await $fetch('/api/profile/goals', { method: 'POST', body })
      toast.add({ title: 'Goal added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save goal', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
