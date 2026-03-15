<template>
  <UiCard title="Projects">
    <template #actions>
      <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="projects.length" class="space-y-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="p-4 rounded-lg border border-white/5 bg-white/[0.02] group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white">{{ project.name }}</h4>
              <span v-if="project.isFeatured" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-400">Featured</span>
            </div>
            <p v-if="project.description" class="text-sm text-zinc-400 mt-1">{{ project.description }}</p>
            <div v-if="project.techStack.length" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="tech in project.techStack"
                :key="tech"
                class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs"
              >{{ tech }}</span>
            </div>
            <div v-if="project.url || project.repoUrl" class="flex gap-3 mt-2">
              <a v-if="project.url" :href="project.url" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <UIcon name="i-heroicons-link" class="w-3 h-3" /> Live
              </a>
              <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <UIcon name="i-heroicons-code-bracket" class="w-3 h-3" /> Repo
              </a>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(project)" />
            <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'project', project.id, project.name)" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No projects added yet.</p>
  </UiCard>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Project' : 'Add Project'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.name"
      placeholder="Project name"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <textarea
      v-model="form.description"
      placeholder="Description (optional)"
      rows="3"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
    <input
      v-model="form.url"
      placeholder="Live URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <input
      v-model="form.repoUrl"
      placeholder="Repo URL (optional)"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <div>
      <label class="text-xs text-zinc-400 block mb-1">Tech stack</label>
      <div class="border border-white/10 rounded-lg px-3 py-2">
        <UiTagInput v-model="form.techStack" placeholder="Add tech..." :lowercase="false" />
      </div>
    </div>
    <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
      <input v-model="form.isFeatured" type="checkbox" class="rounded border-white/10 bg-transparent" />
      Featured project
    </label>
  </UiFormModal>
</template>

<script setup lang="ts">
import type { Project } from '~/server/utils/profile-types'

const props = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Project | null>(null)
const form = reactive({ name: '', description: '', url: '', repoUrl: '', techStack: [] as string[], isFeatured: false })

function openModal(project?: Project) {
  if (project) {
    editing.value = project
    form.name = project.name
    form.description = project.description ?? ''
    form.url = project.url ?? ''
    form.repoUrl = project.repoUrl ?? ''
    form.techStack = [...project.techStack]
    form.isFeatured = project.isFeatured
  } else {
    editing.value = null
    form.name = ''
    form.description = ''
    form.url = ''
    form.repoUrl = ''
    form.techStack = []
    form.isFeatured = false
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      ...form,
      description: form.description || null,
      url: form.url || null,
      repoUrl: form.repoUrl || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/projects/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Project updated', color: 'green' })
    } else {
      await $fetch('/api/profile/projects', { method: 'POST', body })
      toast.add({ title: 'Project added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save project', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
