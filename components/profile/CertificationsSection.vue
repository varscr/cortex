<template>
  <Cards title="Certifications">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="certifications.length" class="space-y-3">
      <div
        v-for="cert in certifications"
        :key="cert.id"
        class="flex items-start justify-between group p-3 rounded-lg border border-white/5 bg-white/[0.02]"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-white">{{ cert.name }}</span>
            <span v-if="cert.platform" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-700 text-zinc-400">{{ cert.platform }}</span>
          </div>
          <p class="text-xs text-zinc-500 mt-0.5">{{ cert.institution }}<span v-if="cert.date"> · {{ formatDate(cert.date) }}</span></p>
        </div>
        <div class="flex items-center gap-1">
          <a v-if="cert.url" :href="cert.url" target="_blank" class="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
            <UIcon name="i-heroicons-link" class="w-3.5 h-3.5" />
          </a>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(cert)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'certification', cert.id, cert.name)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No certifications added yet.</p>
  </Cards>

  <ModalsForm v-model="modalOpen" :title="editing ? 'Edit Certification' : 'Add Certification'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.name"
      placeholder="Certification name"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.institution"
      placeholder="Institution / Issuer"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <div class="grid grid-cols-2 gap-4">
      <input
        v-model="form.platform"
        placeholder="Platform (e.g. Udemy, Platzi)"
        class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
      />
      <div>
        <label class="text-xs text-zinc-400 block mb-1">Date (optional)</label>
        <input
          v-model="form.date"
          type="date"
          class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
        />
      </div>
    </div>
    <input
      v-model="form.url"
      placeholder="Certificate URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
  </ModalsForm>
</template>

<script setup lang="ts">
import type { Certification } from '~/server/utils/profile/types'
import { formatDate } from '~/composables/useFormatDate'

const props = defineProps<{ certifications: Certification[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Certification | null>(null)
const form = reactive({ name: '', institution: '', platform: '', date: '', url: '' })

function openModal(cert?: Certification) {
  if (cert) {
    editing.value = cert
    form.name = cert.name
    form.institution = cert.institution
    form.platform = cert.platform ?? ''
    form.date = cert.date ?? ''
    form.url = cert.url ?? ''
  } else {
    editing.value = null
    form.name = ''
    form.institution = ''
    form.platform = ''
    form.date = ''
    form.url = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      name: form.name,
      institution: form.institution,
      platform: form.platform || null,
      date: form.date || null,
      url: form.url || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/certifications/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Certification updated', color: 'green' })
    } else {
      await $fetch('/api/profile/certifications', { method: 'POST', body })
      toast.add({ title: 'Certification added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save certification', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
