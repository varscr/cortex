<template>
  <div :class="role === 'user' ? 'flex justify-end' : 'flex justify-start'">
    <div :class="role === 'user' ? 'max-w-[85%]' : 'w-full'">
      <div
        :class="[
          'rounded-xl px-3 py-2.5 text-sm leading-relaxed',
          role === 'user' ? 'bg-zinc-700 text-zinc-200' : 'linear-panel text-zinc-300',
        ]"
      >
        <ChatMarkdownRenderer v-if="role === 'assistant'" :content="content" />
        <span v-else>{{ content }}</span>
      </div>

      <div v-if="role === 'assistant' && sources?.length" class="mt-1">
        <button
          class="text-xs text-zinc-700 hover:text-zinc-500 flex items-center gap-1 transition-colors"
          @click="expanded = !expanded"
        >
          <UIcon
            :name="expanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="w-3 h-3"
          />
          {{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }}
        </button>
        <div v-if="expanded" class="mt-1 space-y-1">
          <div
            v-for="src in sources"
            :key="src.source"
            class="text-xs linear-panel rounded px-2 py-1 flex items-center gap-2"
          >
            <span class="text-zinc-600">{{ src.sourceType }}</span>
            <span class="text-zinc-500 truncate flex-1">{{ src.title }}</span>
            <span class="text-zinc-700 flex-shrink-0">{{ (src.similarity * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Source {
  source: string
  sourceType: string
  title: string
  similarity: number
}

defineProps<{
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}>()

const expanded = ref(false)
</script>