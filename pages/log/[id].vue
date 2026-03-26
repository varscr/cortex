<template>
  <div v-if="entry">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <UButton to="/log" icon="i-heroicons-arrow-left" variant="ghost" color="gray" />
        <h2 class="text-2xl font-bold text-white">{{ editing ? 'Edit Entry' : (entry.title || 'Untitled') }}</h2>
      </div>
      <div class="flex gap-2">
        <UButton v-if="!editing" @click="editing = true" icon="i-heroicons-pencil" label="Edit" variant="soft" />
        <UButton v-if="!editing" @click="showDelete = true" icon="i-heroicons-trash" label="Delete" color="red" variant="soft" />
      </div>
    </div>

    <!-- View Mode -->
    <Cards v-if="!editing">
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2 items-center text-sm text-zinc-400">
          <span>{{ entry.date }}</span>
          <UBadge :color="typeColor(entry.entryType)" variant="subtle">
            {{ typeLabel(entry.entryType) }}
          </UBadge>
          <UBadge v-if="entry.mood" :color="moodBadgeColor(entry.mood)" variant="subtle" class="flex items-center gap-1">
            <UIcon :name="moodIcon(entry.mood)" :class="['w-3.5 h-3.5', moodIconColor(entry.mood)]" />
            {{ entry.mood }}
          </UBadge>
          <UBadge v-for="tag in entry.tags" :key="tag" color="primary" variant="subtle" size="xs">{{ tag }}</UBadge>
        </div>

        <div class="text-zinc-200 whitespace-pre-wrap leading-relaxed">{{ entry.content }}</div>

        <p class="text-xs text-zinc-500 pt-4 border-t border-white/5">
          Created {{ entry.createdAt }} · Updated {{ entry.updatedAt }}
        </p>
      </div>
    </Cards>

    <!-- Edit Mode -->
    <div v-else>
      <!-- Type badge -->
      <div class="mb-8">
        <span
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-white/10"
          :class="typeBadgeClass(form.entryType)"
        >
          <UIcon :name="entryIcon(form.entryType)" class="text-sm" />
          {{ typeLabel(form.entryType) }}
        </span>
      </div>

      <form @submit.prevent="save" class="space-y-6">
        <!-- Title -->
        <input
          v-model="form.title"
          type="text"
          placeholder="Title"
          class="w-full bg-transparent border-0 border-b border-transparent focus:border-white/10 text-2xl font-semibold text-white placeholder-zinc-600 outline-none pb-2 transition-colors"
        />

        <!-- Content -->
        <textarea
          v-model="form.content"
          :placeholder="currentConfig?.placeholder ?? 'Start writing...'"
          rows="10"
          class="w-full bg-transparent border-0 border-b border-transparent focus:border-white/10 text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed transition-colors"
          @input="autoResize"
        />

        <!-- Bottom bar -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Mood selector -->
          <div class="flex gap-1">
            <button
              v-for="m in MOODS"
              :key="m.value"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all"
              :class="form.mood === m.value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'"
              @click="form.mood = form.mood === m.value ? '' : m.value"
            >
              <UIcon :name="m.icon" :class="['w-3.5 h-3.5', form.mood === m.value ? '' : m.color]" />
              {{ m.label }}
            </button>
          </div>

          <div class="ml-auto flex items-center gap-4">
            <!-- Date -->
            <input
              v-model="form.date"
              type="date"
              class="bg-transparent border border-white/5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 outline-none focus:border-white/10 transition-colors"
            />

            <!-- Tags -->
            <FormsTagInput v-model="form.tags" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-2">
          <ButtonsSecondary label="Cancel" @click="cancelEdit" />
          <ButtonsPrimary type="submit" label="Save" :loading="saving" />
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <ModalsConfirm
      v-model="showDelete"
      title="Delete Entry"
      message="Are you sure you want to delete this entry? This action cannot be undone."
      confirm-label="Delete"
      :loading="deleting"
      @confirm="deleteEntry"
    />
  </div>
</template>

<script setup lang="ts">
import { ENTRY_CONFIG, type EntryTypeKey } from '~/server/utils/entry-config'

const { entryIcon, typeLabel, typeColor, typeBadgeClass, moodIcon, moodIconColor, moodBadgeColor } = useEntryHelpers()

const route = useRoute()
const router = useRouter()
const toast = useToast()

const editing = ref(false)
const showDelete = ref(false)
const saving = ref(false)
const deleting = ref(false)

const { data: entry, refresh } = await useFetch(`/api/log/${route.params.id}`)

if (!entry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
}

const form = reactive({
  title: '',
  content: '',
  entryType: '',
  mood: '',
  date: '',
  tags: [] as string[],
})

const currentConfig = computed(() => {
  return ENTRY_CONFIG[form.entryType as EntryTypeKey] ?? null
})

function populateForm() {
  if (!entry.value) return
  form.title = entry.value.title ?? ''
  form.content = entry.value.content
  form.entryType = entry.value.entryType
  form.mood = entry.value.mood ?? ''
  form.date = entry.value.date
  form.tags = [...(entry.value.tags ?? [])]
}

watch(editing, (val) => {
  if (val) populateForm()
})

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function cancelEdit() {
  editing.value = false
}

async function save() {
  if (!form.content.trim()) {
    toast.add({ title: 'Content is required', color: 'red' })
    return
  }

  saving.value = true
  try {
    await $fetch(`/api/log/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: form.title || null,
        content: form.content,
        entryType: form.entryType,
        mood: form.mood || null,
        date: form.date,
        tags: form.tags,
      },
    })
    toast.add({ title: 'Entry updated', color: 'green' })
    editing.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to update', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function deleteEntry() {
  deleting.value = true
  try {
    await $fetch(`/api/log/${route.params.id}`, { method: 'DELETE' })
    toast.add({ title: 'Entry deleted', color: 'green' })
    router.push('/log')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
