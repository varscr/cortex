<template>
  <Cards title="Links">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="links.length" class="space-y-2">
      <div
        v-for="link in links"
        :key="link.id"
        class="flex items-center justify-between group"
      >
        <div class="flex items-center gap-3 min-w-0">
          <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <span class="text-sm text-zinc-200">{{ link.label }}</span>
          <a :href="link.url" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 truncate">{{ link.url }}</a>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(link)" />
          <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'link', link.id, link.label)" />
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No links added yet.</p>
  </Cards>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Link' : 'Add Link'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.label"
      placeholder="Label"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.url"
      placeholder="URL"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.icon"
      placeholder="Icon (optional, e.g. i-heroicons-link)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Position</label>
      <input
        v-model.number="form.position"
        type="number"
        min="0"
        class="w-24 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
      />
    </div>
  </UiFormModal>
</template>

<script setup lang="ts">
import type { Link } from '~/server/utils/profile/types'

const props = defineProps<{ links: Link[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Link | null>(null)
const form = reactive({ label: '', url: '', icon: '', position: 0 })

function openModal(link?: Link) {
  if (link) {
    editing.value = link
    form.label = link.label
    form.url = link.url
    form.icon = link.icon ?? ''
    form.position = link.position
  } else {
    editing.value = null
    form.label = ''
    form.url = ''
    form.icon = ''
    form.position = 0
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      ...form,
      icon: form.icon || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/links/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Link updated', color: 'green' })
    } else {
      await $fetch('/api/profile/links', { method: 'POST', body })
      toast.add({ title: 'Link added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save link', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
