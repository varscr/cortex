<template>
  <Cards title="Education">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="education.length" class="space-y-6">
      <div
        v-for="edu in education"
        :key="edu.id"
        class="relative pl-6 border-l border-white/10 group"
      >
        <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="edu.isCurrent ? 'bg-blue-500' : 'bg-zinc-600'" />
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white">{{ edu.degree }}</h4>
              <span v-if="edu.isCurrent" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-400">Current</span>
            </div>
            <p class="text-sm text-zinc-400">{{ edu.institution }}</p>
            <p v-if="edu.fieldOfStudy" class="text-xs text-zinc-500">{{ edu.fieldOfStudy }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">{{ formatDateRange(edu.startDate, edu.endDate) }}</p>
            <p v-if="edu.description" class="text-sm text-zinc-400 mt-2">{{ edu.description }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(edu)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'education', edu.id, `${edu.degree} at ${edu.institution}`)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No education added yet.</p>
  </Cards>

  <ModalsForm v-model="modalOpen" :title="editing ? 'Edit Education' : 'Add Education'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.institution"
      placeholder="Institution"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.degree"
      placeholder="Degree"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.fieldOfStudy"
      placeholder="Field of study (optional)"
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
      Currently enrolled
    </label>
    <textarea
      v-model="form.description"
      placeholder="Description (optional)"
      rows="3"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
  </ModalsForm>
</template>

<script setup lang="ts">
import type { Education } from '~/server/utils/profile/types'
import { formatDateRange } from '~/composables/useFormatDate'

const props = defineProps<{ education: Education[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Education | null>(null)
const form = reactive({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '', isCurrent: false })

function openModal(edu?: Education) {
  if (edu) {
    editing.value = edu
    form.institution = edu.institution
    form.degree = edu.degree
    form.fieldOfStudy = edu.fieldOfStudy ?? ''
    form.startDate = edu.startDate
    form.endDate = edu.endDate ?? ''
    form.description = edu.description ?? ''
    form.isCurrent = edu.isCurrent
  } else {
    editing.value = null
    form.institution = ''
    form.degree = ''
    form.fieldOfStudy = ''
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
      fieldOfStudy: form.fieldOfStudy || null,
      endDate: form.endDate || null,
      description: form.description || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/education/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Education updated', color: 'green' })
    } else {
      await $fetch('/api/profile/education', { method: 'POST', body })
      toast.add({ title: 'Education added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save education', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
