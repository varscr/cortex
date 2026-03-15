<template>
  <UiCard title="Experience">
    <template #actions>
      <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="experience.length" class="space-y-6">
      <div
        v-for="exp in experience"
        :key="exp.id"
        class="relative pl-6 border-l border-white/10 group"
      >
        <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="exp.isCurrent ? 'bg-green-500' : 'bg-zinc-600'" />
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white">{{ exp.role }}</h4>
              <span v-if="exp.isCurrent" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/10 text-green-400">Current</span>
            </div>
            <p class="text-sm text-zinc-400">{{ exp.company }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">{{ formatDateRange(exp.startDate, exp.endDate) }}</p>
            <p v-if="exp.description" class="text-sm text-zinc-400 mt-2">{{ exp.description }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(exp)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'experience', exp.id, `${exp.role} at ${exp.company}`)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No experience added yet.</p>
  </UiCard>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Experience' : 'Add Experience'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.company"
      placeholder="Company"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.role"
      placeholder="Role / Title"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-xs text-zinc-400 block mb-1">Start date</label>
        <input
          v-model="form.startDate"
          type="date"
          class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
        />
      </div>
      <div>
        <label class="text-xs text-zinc-400 block mb-1">End date</label>
        <input
          v-model="form.endDate"
          type="date"
          :disabled="form.isCurrent"
          class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors disabled:opacity-40"
        />
      </div>
    </div>
    <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
      <input v-model="form.isCurrent" type="checkbox" class="rounded border-white/10 bg-transparent" @change="form.isCurrent && (form.endDate = '')" />
      Currently working here
    </label>
    <textarea
      v-model="form.description"
      placeholder="Description (optional)"
      rows="3"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
  </UiFormModal>
</template>

<script setup lang="ts">
import type { Experience } from '~/server/utils/profile-types'
import { formatDateRange } from '~/composables/useFormatDate'

const props = defineProps<{ experience: Experience[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Experience | null>(null)
const form = reactive({ company: '', role: '', startDate: '', endDate: '', description: '', isCurrent: false })

function openModal(exp?: Experience) {
  if (exp) {
    editing.value = exp
    form.company = exp.company
    form.role = exp.role
    form.startDate = exp.startDate
    form.endDate = exp.endDate ?? ''
    form.description = exp.description ?? ''
    form.isCurrent = exp.isCurrent
  } else {
    editing.value = null
    form.company = ''
    form.role = ''
    form.startDate = ''
    form.endDate = ''
    form.description = ''
    form.isCurrent = false
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      ...form,
      endDate: form.endDate || null,
      description: form.description || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/experience/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Experience updated', color: 'green' })
    } else {
      await $fetch('/api/profile/experience', { method: 'POST', body })
      toast.add({ title: 'Experience added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save experience', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
