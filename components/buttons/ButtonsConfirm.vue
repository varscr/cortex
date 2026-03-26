<template>
  <div class="flex items-center gap-2 mt-1.5">
    <span class="text-xs text-amber-400">Switch provider?</span>
    <button
      class="text-xs px-2 py-0.5 rounded transition-colors bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
      @click="$emit('confirm')"
    >
      {{ confirmText }}
    </button>
    <button
      class="text-xs px-2 py-0.5 rounded transition-colors bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
      @click="$emit('cancel')"
    >
      {{ cancelText }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  confirmText?: string
  cancelText?: string
}>(), {
  confirmText: 'Yes',
  cancelText: 'No'
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>