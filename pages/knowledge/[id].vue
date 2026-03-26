<template>
  <div v-if="entry">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <UButton to="/knowledge" icon="i-heroicons-arrow-left" variant="ghost" color="gray" />
        <h2 class="text-2xl font-bold text-white">{{ editing ? 'Edit Entry' : entry.title }}</h2>
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
          <UBadge :color="categoryBadgeColor(entry.category)" variant="subtle" class="flex items-center gap-1">
            <UIcon :name="categoryIcon(entry.category)" class="w-3.5 h-3.5" />
            {{ categoryLabel(entry.category) }}
          </UBadge>
          <UBadge :color="confidenceBadgeColor(entry.confidence)" variant="subtle" class="flex items-center gap-1">
            <UIcon :name="confidenceIcon(entry.confidence)" :class="['w-3.5 h-3.5', confidenceColor(entry.confidence)]" />
            {{ confidenceLabel(entry.confidence) }}
          </UBadge>
          <UBadge
            :color="entry.isReviewed ? 'green' : 'gray'"
            variant="subtle"
            class="flex items-center gap-1"
          >
            <UIcon :name="entry.isReviewed ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'" class="w-3.5 h-3.5" />
            {{ entry.isReviewed ? 'Reviewed' : 'Unreviewed' }}
          </UBadge>
          <UBadge v-for="tag in entry.tags" :key="tag" color="primary" variant="subtle" size="xs">{{ tag }}</UBadge>
        </div>

        <!-- Source conversation -->
        <div v-if="entry.sourceConversationTitle" class="text-sm text-zinc-500 flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4" />
          Source: {{ entry.sourceConversationTitle }}
        </div>

        <div class="text-zinc-200 whitespace-pre-wrap leading-relaxed">{{ entry.content }}</div>

        <p class="text-xs text-zinc-500 pt-4 border-t border-white/5">
          Created {{ entry.createdAt }} · Updated {{ entry.updatedAt }}
        </p>
      </div>
    </Cards>

    <!-- Edit Mode -->
    <div v-else>
      <form @submit.prevent="save" class="space-y-6">
        <!-- Title -->
        <input
          v-model="form.title"
          type="text"
          placeholder="What did you learn?"
          class="w-full bg-transparent border-0 border-b border-transparent focus:border-white/10 text-2xl font-semibold text-white placeholder-zinc-600 outline-none pb-2 transition-colors"
        />

        <!-- Content -->
        <textarea
          v-model="form.content"
          placeholder="Describe this knowledge in detail..."
          rows="10"
          class="w-full bg-transparent border-0 border-b border-transparent focus:border-white/10 text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed transition-colors"
          @input="autoResize"
        />

        <!-- Bottom bar -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Category -->
          <UiFilterDropdown v-model="form.category" :options="categoryFormOptions" placeholder="Category" width="w-44">
            <template #option="{ option, isActive }">
              <span class="flex items-center gap-2">
                <UIcon v-if="option.value" :name="categoryIcon(option.value)" :class="['w-3.5 h-3.5', categoryColor(option.value)]" />
                {{ option.label }}
              </span>
            </template>
          </UiFilterDropdown>

          <!-- Confidence selector -->
          <div class="flex gap-1">
            <button
              v-for="c in CONFIDENCES"
              :key="c.value"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all"
              :class="form.confidence === c.value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'"
              @click="form.confidence = c.value"
            >
              <UIcon :name="c.icon" :class="['w-3.5 h-3.5', form.confidence === c.value ? '' : c.color]" />
              {{ c.label }}
            </button>
          </div>

          <!-- Reviewed toggle -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all"
            :class="form.isReviewed
              ? 'bg-emerald-900/50 text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'"
            @click="form.isReviewed = !form.isReviewed"
          >
            <UIcon
              :name="form.isReviewed ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'"
              class="w-3.5 h-3.5"
            />
            {{ form.isReviewed ? 'Reviewed' : 'Unreviewed' }}
          </button>

          <div class="ml-auto flex items-center gap-4">
            <!-- Tags -->
            <UiTagInput v-model="form.tags" />
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
    <UiConfirmModal
      v-model="showDelete"
      title="Delete Entry"
      message="Are you sure you want to delete this knowledge entry? This action cannot be undone."
      confirm-label="Delete"
      :loading="deleting"
      @confirm="deleteEntry"
    />
  </div>
</template>

<script setup lang="ts">
import { CONFIDENCES } from '~/composables/useKnowledgeHelpers'

const { categoryIcon, categoryColor, categoryBadgeColor, categoryLabel, confidenceIcon, confidenceColor, confidenceBadgeColor, confidenceLabel } = useKnowledgeHelpers()

const route = useRoute()
const router = useRouter()
const toast = useToast()

const editing = ref(false)
const showDelete = ref(false)
const saving = ref(false)
const deleting = ref(false)

const { data: entry, refresh } = await useFetch(`/api/knowledge/${route.params.id}`)

if (!entry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
}

const categoryFormOptions = [
  { label: 'Programming', value: 'programming' },
  { label: 'Architecture', value: 'architecture' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Concept', value: 'concept' },
  { label: 'Workflow', value: 'workflow' },
  { label: 'Tool', value: 'tool' },
  { label: 'Pattern', value: 'pattern' },
  { label: 'Other', value: 'other' },
]

const form = reactive({
  title: '',
  content: '',
  category: '',
  confidence: '',
  isReviewed: false,
  tags: [] as string[],
})

function populateForm() {
  if (!entry.value) return
  form.title = entry.value.title
  form.content = entry.value.content
  form.category = entry.value.category
  form.confidence = entry.value.confidence
  form.isReviewed = entry.value.isReviewed
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
  if (!form.title.trim()) {
    toast.add({ title: 'Title is required', color: 'red' })
    return
  }
  if (!form.content.trim()) {
    toast.add({ title: 'Content is required', color: 'red' })
    return
  }

  saving.value = true
  try {
    await $fetch(`/api/knowledge/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: form.title,
        content: form.content,
        category: form.category,
        confidence: form.confidence,
        isReviewed: form.isReviewed,
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
    await $fetch(`/api/knowledge/${route.params.id}`, { method: 'DELETE' })
    toast.add({ title: 'Entry deleted', color: 'green' })
    router.push('/knowledge')
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
