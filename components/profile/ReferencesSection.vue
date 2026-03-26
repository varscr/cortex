<template>
  <Cards title="References">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="references.length" class="space-y-3">
      <div
        v-for="ref in references"
        :key="ref.id"
        class="flex items-start justify-between group p-3 rounded-lg border border-white/5 bg-white/[0.02]"
      >
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium text-white">{{ ref.name }}</span>
          <p v-if="ref.title" class="text-xs text-zinc-400 mt-0.5">{{ ref.title }}</p>
          <p v-if="ref.contact" class="text-xs text-zinc-500 mt-0.5">{{ ref.contact }}</p>
          <p v-if="ref.notes" class="text-xs text-zinc-500 italic mt-1">{{ ref.notes }}</p>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(ref)" />
          <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'reference', ref.id, ref.name)" />
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No references added yet.</p>
  </Cards>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Reference' : 'Add Reference'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.name"
      placeholder="Name"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.title"
      placeholder="Title / Position (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.contact"
      placeholder="Contact (email, phone, LinkedIn)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <textarea
      v-model="form.notes"
      placeholder="Notes (optional)"
      rows="2"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
  </UiFormModal>
</template>

<script setup lang="ts">
import type { Reference } from '~/server/utils/profile/types'

const props = defineProps<{ references: Reference[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Reference | null>(null)
const form = reactive({ name: '', title: '', contact: '', notes: '' })

function openModal(ref?: Reference) {
  if (ref) {
    editing.value = ref
    form.name = ref.name
    form.title = ref.title ?? ''
    form.contact = ref.contact ?? ''
    form.notes = ref.notes ?? ''
  } else {
    editing.value = null
    form.name = ''
    form.title = ''
    form.contact = ''
    form.notes = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      name: form.name,
      title: form.title || null,
      contact: form.contact || null,
      notes: form.notes || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/references/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Reference updated', color: 'green' })
    } else {
      await $fetch('/api/profile/references', { method: 'POST', body })
      toast.add({ title: 'Reference added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save reference', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
