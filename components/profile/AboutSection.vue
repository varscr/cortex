<template>
  <UiCard title="About">
    <template #actions>
      <UiButton icon="i-heroicons-pencil-square" size="sm" label="Edit" @click="openModal()" />
    </template>

    <div v-if="about" class="space-y-3">
      <div v-if="about.headline" class="text-sm font-medium text-white">{{ about.headline }}</div>
      <p v-if="about.bio" class="text-sm text-zinc-400 whitespace-pre-line">{{ about.bio }}</p>
      <p v-if="about.location" class="text-xs text-zinc-500 flex items-center gap-1">
        <UIcon name="i-heroicons-map-pin" class="w-3 h-3" /> {{ about.location }}
      </p>
    </div>
    <p v-else class="text-sm text-zinc-500">No about info yet. Click Edit to add your profile.</p>
  </UiCard>

  <UiFormModal v-model="modalOpen" title="Edit About" :loading="saving" @submit="save">
    <input
      v-model="form.headline"
      placeholder="Headline"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <textarea
      v-model="form.bio"
      placeholder="Bio"
      rows="4"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
    <input
      v-model="form.location"
      placeholder="Location (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.avatarUrl"
      placeholder="Avatar URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
  </UiFormModal>
</template>

<script setup lang="ts">
import type { About } from '~/server/utils/profile-types'

const props = defineProps<{ about: About | null }>()
const emit = defineEmits<{ refresh: [] }>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const form = reactive({ headline: '', bio: '', location: '', avatarUrl: '' })

function openModal() {
  if (props.about) {
    form.headline = props.about.headline ?? ''
    form.bio = props.about.bio ?? ''
    form.location = props.about.location ?? ''
    form.avatarUrl = props.about.avatarUrl ?? ''
  } else {
    form.headline = ''
    form.bio = ''
    form.location = ''
    form.avatarUrl = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      headline: form.headline || null,
      bio: form.bio || null,
      location: form.location || null,
      avatarUrl: form.avatarUrl || null,
    }
    await $fetch('/api/profile/about', { method: 'PUT', body })
    toast.add({ title: 'About updated', color: 'green' })
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save about', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
