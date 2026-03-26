<template>
  <UiCard title="About">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-pencil-square" size="sm" label="Edit" @click="openModal()" />
    </template>

    <div v-if="about" class="space-y-3">
      <div v-if="about.headline" class="text-sm font-medium text-white">{{ about.headline }}</div>
      <div v-if="about.jobTitle" class="text-xs text-zinc-400">{{ about.jobTitle }}</div>
      <div v-if="about.status" class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">{{ about.status }}</div>
      <p v-if="about.bio" class="text-sm text-zinc-400 whitespace-pre-line">{{ about.bio }}</p>
      <div class="flex flex-wrap gap-3 text-xs text-zinc-500">
        <span v-if="about.location" class="flex items-center gap-1">
          <UIcon name="i-heroicons-map-pin" class="w-3 h-3" /> {{ about.location }}
        </span>
        <a v-if="about.email" :href="`mailto:${about.email}`" class="flex items-center gap-1 hover:text-zinc-300 transition-colors">
          <UIcon name="i-heroicons-envelope" class="w-3 h-3" /> {{ about.email }}
        </a>
        <a v-if="about.cvPdfUrl" :href="about.cvPdfUrl" target="_blank" class="flex items-center gap-1 hover:text-zinc-300 transition-colors">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-3 h-3" /> Download CV
        </a>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No about info yet. Click Edit to add your profile.</p>
  </UiCard>

  <UiFormModal v-model="modalOpen" title="Edit About" :loading="saving" @submit="save">
    <input
      v-model="form.headline"
      placeholder="Headline"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.jobTitle"
      placeholder="Job title (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.status"
      placeholder="Status (e.g. Freelancing & actively job hunting)"
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
      v-model="form.email"
      placeholder="Email (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.avatarUrl"
      placeholder="Avatar URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.cvPdfUrl"
      placeholder="CV PDF URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <div>
      <label class="text-xs text-zinc-400 block mb-1">CV HTML (optional)</label>
      <textarea
        v-model="form.cvHtml"
        placeholder="Paste your CV HTML here..."
        rows="6"
        class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none font-mono"
      />
    </div>
  </UiFormModal>
</template>

<script setup lang="ts">
import type { About } from '~/server/utils/profile-types'

const props = defineProps<{ about: About | null }>()
const emit = defineEmits<{ refresh: [] }>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const form = reactive({ headline: '', jobTitle: '', status: '', bio: '', location: '', email: '', avatarUrl: '', cvPdfUrl: '', cvHtml: '' })

function openModal() {
  if (props.about) {
    form.headline = props.about.headline ?? ''
    form.jobTitle = props.about.jobTitle ?? ''
    form.status = props.about.status ?? ''
    form.bio = props.about.bio ?? ''
    form.location = props.about.location ?? ''
    form.email = props.about.email ?? ''
    form.avatarUrl = props.about.avatarUrl ?? ''
    form.cvPdfUrl = props.about.cvPdfUrl ?? ''
    form.cvHtml = props.about.cvHtml ?? ''
  } else {
    form.headline = ''
    form.jobTitle = ''
    form.status = ''
    form.bio = ''
    form.location = ''
    form.email = ''
    form.avatarUrl = ''
    form.cvPdfUrl = ''
    form.cvHtml = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      headline: form.headline || null,
      jobTitle: form.jobTitle || null,
      status: form.status || null,
      bio: form.bio || null,
      location: form.location || null,
      email: form.email || null,
      avatarUrl: form.avatarUrl || null,
      cvPdfUrl: form.cvPdfUrl || null,
      cvHtml: form.cvHtml || null,
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
