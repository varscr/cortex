<template>
  <Cards title="Experience">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="experience.length" class="space-y-6">
      <div
        v-for="exp in experience"
        :key="exp.id"
        class="relative pl-6 border-l border-white/10 group"
      >
        <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="exp.isCurrent ? 'bg-green-500' : 'bg-zinc-600'" />
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-sm font-medium text-white">{{ exp.role }}</h4>
              <span v-if="exp.isCurrent" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/10 text-green-400">Current</span>
              <span v-if="exp.employmentType" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-700 text-zinc-400">{{ exp.employmentType }}</span>
            </div>
            <p class="text-sm text-zinc-400">{{ exp.company }}<span v-if="exp.location" class="text-zinc-500"> · {{ exp.location }}</span></p>
            <p class="text-xs text-zinc-500 mt-0.5">{{ formatDateRange(exp.startDate, exp.endDate) }}</p>
            <p v-if="exp.description" class="text-sm text-zinc-400 mt-2">{{ exp.description }}</p>
            <ul v-if="exp.highlights.length" class="mt-2 space-y-1">
              <li v-for="h in exp.highlights" :key="h" class="text-sm text-zinc-400 flex gap-2">
                <span class="text-zinc-600 flex-shrink-0">–</span>{{ h }}
              </li>
            </ul>
            <div v-if="exp.techStack.length" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="tech in exp.techStack"
                :key="tech"
                class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs"
              >{{ tech }}</span>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(exp)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'experience', exp.id, `${exp.role} at ${exp.company}`)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No experience added yet.</p>
  </Cards>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Experience' : 'Add Experience'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <div class="grid grid-cols-2 gap-4">
      <input
        v-model="form.company"
        placeholder="Company"
        class="col-span-2 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
      />
      <input
        v-model="form.role"
        placeholder="Role / Title"
        class="col-span-2 w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
      />
      <input
        v-model="form.location"
        placeholder="Location (optional)"
        class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
      />
      <select
        v-model="form.employmentType"
        class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
      >
        <option value="">Employment type</option>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Freelance</option>
        <option>Contract</option>
      </select>
    </div>
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
      rows="2"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Highlights</label>
      <div class="border border-white/10 rounded-lg px-3 py-2">
        <UiTagInput v-model="form.highlights" placeholder="Add bullet point..." :lowercase="false" />
      </div>
    </div>
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Tech stack</label>
      <div class="border border-white/10 rounded-lg px-3 py-2">
        <UiTagInput v-model="form.techStack" placeholder="Add tech..." :lowercase="false" />
      </div>
    </div>
    <textarea
      v-model="form.reasonForLeaving"
      placeholder="Reason for leaving (optional, private)"
      rows="2"
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
const form = reactive({
  company: '',
  role: '',
  location: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  description: '',
  isCurrent: false,
  highlights: [] as string[],
  techStack: [] as string[],
  reasonForLeaving: '',
})

function openModal(exp?: Experience) {
  if (exp) {
    editing.value = exp
    form.company = exp.company
    form.role = exp.role
    form.location = exp.location ?? ''
    form.employmentType = exp.employmentType ?? ''
    form.startDate = exp.startDate
    form.endDate = exp.endDate ?? ''
    form.description = exp.description ?? ''
    form.isCurrent = exp.isCurrent
    form.highlights = [...exp.highlights]
    form.techStack = [...exp.techStack]
    form.reasonForLeaving = exp.reasonForLeaving ?? ''
  } else {
    editing.value = null
    form.company = ''
    form.role = ''
    form.location = ''
    form.employmentType = ''
    form.startDate = ''
    form.endDate = ''
    form.description = ''
    form.isCurrent = false
    form.highlights = []
    form.techStack = []
    form.reasonForLeaving = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      company: form.company,
      role: form.role,
      location: form.location || null,
      employmentType: form.employmentType || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      description: form.description || null,
      isCurrent: form.isCurrent,
      highlights: form.highlights,
      techStack: form.techStack,
      reasonForLeaving: form.reasonForLeaving || null,
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
