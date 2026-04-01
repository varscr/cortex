<template>
  <div class="px-3 py-3 border-t border-white/5 flex-shrink-0">
    <div class="flex items-center gap-2 linear-panel rounded-xl px-3 py-2">
      <textarea
        ref="textareaEl"
        :value="modelValue"
        placeholder="Ask anything..."
        rows="1"
        class="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none max-h-28 overflow-y-auto"
        :disabled="disabled"
        @keydown.enter.exact.prevent="$emit('send')"
        @input="onInput"
      />
      <button
        :disabled="!modelValue.trim() || disabled"
        class="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        @click="$emit('send')"
      >
        <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 text-zinc-300" />
      </button>
    </div>
    <p class="text-xs text-zinc-700 mt-1 text-center">Enter to send · Shift+Enter for new line</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

const textareaEl = ref<HTMLTextAreaElement | null>(null)

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  autoResize()
}

function autoResize() {
  if (!textareaEl.value) return
  textareaEl.value.style.height = 'auto'
  textareaEl.value.style.height = `${Math.min(textareaEl.value.scrollHeight, 112)}px`
}

defineExpose({
  focus: () => textareaEl.value?.focus(),
  clear: () => {
    emit('update:modelValue', '')
    if (textareaEl.value) {
      textareaEl.value.style.height = 'auto'
    }
  }
})
</script>