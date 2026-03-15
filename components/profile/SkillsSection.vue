<template>
  <UiCard title="Skills">
    <template #actions>
      <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openModal()" />
    </template>

    <div v-if="skills.length" class="space-y-6">
      <div v-for="(group, category) in skillsByCategory" :key="category">
        <h4 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{{ category }}</h4>
        <div class="space-y-2">
          <div
            v-for="skill in group"
            :key="skill.id"
            class="flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm text-zinc-200">{{ skill.name }}</span>
              <div class="flex gap-1">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="w-1.5 h-1.5 rounded-full"
                  :class="i <= skill.proficiency ? 'bg-white' : 'bg-zinc-700'"
                />
              </div>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openModal(skill)" />
              <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="emit('delete', 'skill', skill.id, skill.name)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-500">No skills added yet.</p>
  </UiCard>

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
    <div>
      <label class="text-xs text-zinc-400 block mb-2">Proficiency</label>
      <div class="flex gap-2">
        <button
          v-for="i in 5"
          :key="i"
          type="button"
          class="w-8 h-8 rounded-full border transition-colors"
          :class="i <= form.proficiency ? 'bg-white border-white text-zinc-900' : 'border-white/10 text-zinc-500 hover:border-white/20'"
          @click="form.proficiency = i"
        >{{ i }}</button>
      </div>
    </div>
  </UiFormModal>
</template>

<script setup lang="ts">
import { SKILL_CATEGORIES } from '~/server/utils/profile-types'
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
const form = reactive({ name: '', category: '', proficiency: 3 })

const skillsByCategory = computed(() => {
  const grouped: Record<string, Skill[]> = {}
  for (const skill of props.skills) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }
  return grouped
})

function openModal(skill?: Skill) {
  if (skill) {
    editing.value = skill
    form.name = skill.name
    form.category = skill.category
    form.proficiency = skill.proficiency
  } else {
    editing.value = null
    form.name = ''
    form.category = ''
    form.proficiency = 3
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await $fetch(`/api/profile/skills/${editing.value.id}`, { method: 'PUT', body: form })
      toast.add({ title: 'Skill updated', color: 'green' })
    } else {
      await $fetch('/api/profile/skills', { method: 'POST', body: form })
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
