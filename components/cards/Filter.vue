<template>
  <div 
    class="linear-panel rounded-xl p-3 flex flex-wrap items-center gap-3"
    :class="gap"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  gap?: string
}>(), {
  gap: 'gap-3'
})
</script>