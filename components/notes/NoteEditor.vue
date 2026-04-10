<template>
  <div class="flex flex-col h-full">
    <!-- Empty state -->
    <div v-if="!note && !isNew" class="flex-1 flex flex-col items-center justify-center text-center p-8">
      <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-zinc-700 mb-3" />
      <p class="text-zinc-500 text-sm">Select a note or create a new one</p>
    </div>

    <!-- Editor -->
    <template v-else>
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 gap-3">
        <input
          v-model="form.title"
          placeholder="Note title..."
          class="flex-1 bg-transparent text-base font-semibold text-zinc-100 placeholder-zinc-600 outline-none"
        />
        <div class="flex items-center gap-2 shrink-0">
          <ButtonsIcon
            icon="i-heroicons-map-pin"
            :active="form.isPinned"
            title="Pin note"
            @click="form.isPinned = !form.isPinned"
          />
          <ButtonsDanger v-if="!isNew" label="Delete" :loading="deleting" @click="showConfirm = true" />
          <ButtonsPrimary label="Save" :loading="saving" @click="handleSave" />
        </div>
      </div>

      <div class="px-4 py-3 border-b border-white/5 flex items-center gap-4">
        <FiltersFilter v-model="form.type" :options="typeOptions" placeholder="Type..." />
        <div class="flex-1 border border-white/5 rounded-lg px-3 py-1.5 bg-white/5">
          <FormsTagInput v-model="form.tags" placeholder="Add tag..." />
        </div>
      </div>

      <textarea
        v-model="form.content"
        placeholder="Write your note..."
        class="flex-1 w-full bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none resize-none px-4 py-4"
      />
    </template>

    <ModalsConfirm
      v-model="showConfirm"
      title="Delete Note"
      message="Are you sure you want to delete this note? This cannot be undone."
      confirm-label="Delete"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/server/utils/notes/types'

const props = defineProps<{
  note: Note | null
  isNew: boolean
}>()

const emit = defineEmits<{
  saved: [note: Note]
  deleted: [id: number]
  new: []
}>()

const { createNote, updateNote, deleteNote } = useNotesApi()
const toast = useToast()

const typeOptions = [
  { value: 'general', label: 'General' },
  { value: 'project', label: 'Project' },
  { value: 'job', label: 'Job' },
  { value: 'technical', label: 'Technical' },
]

const saving = ref(false)
const deleting = ref(false)
const showConfirm = ref(false)

const form = reactive({
  title: '',
  content: '',
  type: 'general',
  tags: [] as string[],
  isPinned: false,
})

watch(
  () => props.note,
  (note) => {
    if (note) {
      form.title = note.title
      form.content = note.content
      form.type = note.type
      form.tags = [...note.tags]
      form.isPinned = note.isPinned
    }
  },
  { immediate: true },
)

watch(
  () => props.isNew,
  (val) => {
    if (val) {
      form.title = ''
      form.content = ''
      form.type = 'general'
      form.tags = []
      form.isPinned = false
    }
  },
)

async function handleSave() {
  if (!form.title.trim()) {
    toast.add({ title: 'Title is required', color: 'red' })
    return
  }
  saving.value = true
  try {
    const body = {
      title: form.title.trim(),
      content: form.content,
      type: form.type,
      tags: form.tags,
      isPinned: form.isPinned,
    }
    const saved = props.isNew || !props.note
      ? await createNote(body)
      : await updateNote(props.note.id, body)
    emit('saved', saved)
    toast.add({ title: 'Note saved', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to save note', color: 'red' })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!props.note) return
  deleting.value = true
  try {
    await deleteNote(props.note.id)
    showConfirm.value = false
    emit('deleted', props.note.id)
    toast.add({ title: 'Note deleted', color: 'green' })
  } catch {
    toast.add({ title: 'Failed to delete note', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
