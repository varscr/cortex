<template>
  <Cards title="Skills">
    <template #actions>
      <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="skills.length" class="space-y-6">
      <div v-for="(group, category) in skillsByCategory" :key="category">
        <h4 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{{ category }}</h4>
        <div class="space-y-2">
          <div
            v-for="skill in group"
            :key="skill.id"
            class="flex items-start justify-between group"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm text-zinc-200">{{ skill.name }}</span>
                <span
                  v-if="skill.level"
                  class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                  :class="levelClass(skill.level)"
                >{{ skill.level }}</span>
              </div>
              <p v-if="skill.notes" class="text-xs text-zinc-500 italic mt-0.5">{{ skill.notes }}</p>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(skill)" />
              <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'skill', skill.id, skill.name)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No skills added yet.</p>
  </Cards>

  <UiFormModal v-model="modalOpen" :title="editing ? 'Edit Skill' : 'Add Skill'" :submit-label="editing ? 'Update' : 'Add'" :loading="saving" @submit="save">
    <input
      v-model="form.name"
      placeholder="Skill name"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
    />
    <select
      v-model="form.category"
      class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
    >
      <option value="" disabled>Select category</option>
      <option v-for="cat in SKILL_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
    </select>
    <select
      v-model="form.level"
      class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
    >
      <option value="">No level set</option>
      <option v-for="lvl in SKILL_LEVELS" :key="lvl" :value="lvl">{{ lvl }}</option>
    </select>
    <textarea
      v-model="form.notes"
      placeholder="Notes (optional, e.g. context about your experience level)"
      rows="2"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
    />
  </UiFormModal>
</template>

<script setup lang="ts">
import { SKILL_CATEGORIES, SKILL_LEVELS } from '~/server/utils/profile-types'
import type { Skill } from '~/server/utils/profile-types'

const props = defineProps<{ skills: Skill[] }>()
const emit = defineEmits<{
  refresh: []
  delete: [type: string, id: number, name: string]
}>()

const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const editing = ref<Skill | null>(null)
const form = reactive({ name: '', category: '', level: '', notes: '' })

const skillsByCategory = computed(() => {
  const grouped: Record<string, Skill[]> = {}
  for (const skill of props.skills) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }
  return grouped
})

function levelClass(level: string) {
  const map: Record<string, string> = {
    Advanced: 'bg-green-500/10 text-green-400',
    Intermediate: 'bg-blue-500/10 text-blue-400',
    Learning: 'bg-amber-500/10 text-amber-400',
    Exposure: 'bg-zinc-700 text-zinc-400',
    Basic: 'bg-zinc-700 text-zinc-400',
  }
  return map[level] ?? 'bg-zinc-700 text-zinc-400'
}

function openModal(skill?: Skill) {
  if (skill) {
    editing.value = skill
    form.name = skill.name
    form.category = skill.category
    form.level = skill.level ?? ''
    form.notes = skill.notes ?? ''
  } else {
    editing.value = null
    form.name = ''
    form.category = ''
    form.level = ''
    form.notes = ''
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      name: form.name,
      category: form.category,
      level: form.level || null,
      notes: form.notes || null,
    }
    if (editing.value) {
      await $fetch(`/api/profile/skills/${editing.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Skill updated', color: 'green' })
    } else {
      await $fetch('/api/profile/skills', { method: 'POST', body })
      toast.add({ title: 'Skill added', color: 'green' })
    }
    modalOpen.value = false
    emit('refresh')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save skill', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
