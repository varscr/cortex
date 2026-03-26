<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UButton to="/log" icon="i-heroicons-arrow-left" variant="ghost" color="gray" />
      <h2 class="text-2xl font-bold text-white">New Entry</h2>
    </div>

    <!-- Type Picker -->
    <div v-if="!selectedType" class="grid grid-cols-1 gap-4 mt-12">
      <button
        v-for="(config, key) in ENTRY_CONFIG"
        :key="key"
        class="text-left p-6 rounded-xl border border-white/5 bg-zinc-900/50 hover:border-white/10 hover:bg-zinc-900 transition-all group"
        @click="selectType(key)"
      >
        <div class="flex items-center gap-3 mb-2">
          <UIcon :name="config.icon" class="text-xl" :class="typeIconColor(key)" />
          <span class="font-semibold text-white">{{ config.label }}</span>
        </div>
        <p class="text-sm text-zinc-400 group-hover:text-zinc-300">{{ config.description }}</p>
      </button>
    </div>

    <!-- Entry Form -->
    <div v-else>
      <!-- Type badge -->
      <div class="mb-8">
        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-white/10 hover:border-white/15 transition-colors"
          :class="typeBadgeClass(selectedType)"
          @click="selectedType = null"
        >
          <UIcon :name="typeConfig.icon" class="text-sm" />
          {{ typeConfig.label }}
          <UIcon name="i-heroicons-x-mark" class="text-xs opacity-60" />
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-6">
        <!-- Title -->
        <input
          v-model="form.title"
          type="text"
          placeholder="Title"
          class="w-full bg-transparent border-0 border-b border-transparent focus:border-white/10 text-2xl font-semibold text-white placeholder-zinc-600 outline-none pb-2 transition-colors"
        />

        <!-- Content -->
        <textarea
          ref="contentRef"
          v-model="form.content"
          :placeholder="typeConfig.placeholder"
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
          <NuxtLink to="/log" class="text-sm text-zinc-400 hover:text-white transition-colors">Cancel</NuxtLink>
          <ButtonsPrimary type="submit" label="Save" :loading="saving" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ENTRY_CONFIG, type EntryTypeKey } from '~/server/utils/entry-config'

const { typeIconColor, typeBadgeClass } = useEntryHelpers()

const toast = useToast()
const router = useRouter()

const selectedType = ref<EntryTypeKey | null>(null)
const contentRef = ref<HTMLTextAreaElement>()

const typeConfig = computed(() => ENTRY_CONFIG[selectedType.value!])

const form = reactive({
  title: '',
  content: '',
  mood: '',
  date: new Date().toISOString().split('T')[0],
  tags: [] as string[],
})

const saving = ref(false)

function selectType(key: string) {
  selectedType.value = key as EntryTypeKey
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

async function submit() {
  if (!form.content.trim()) {
    toast.add({ title: 'Content is required', color: 'red' })
    return
  }

  saving.value = true
  try {
    const entry = await $fetch('/api/log', {
      method: 'POST',
      body: {
        title: form.title || null,
        content: form.content,
        entryType: selectedType.value,
        mood: form.mood || null,
        date: form.date,
        tags: form.tags,
      },
    })
    toast.add({ title: 'Entry created', color: 'green' })
    router.push(`/log/${entry.id}`)
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to create entry', color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
