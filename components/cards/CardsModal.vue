<template>
  <div 
    class="linear-panel rounded-xl overflow-hidden"
    :class="{ 'p-0': noPadding }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  noPadding?: boolean
}>(), {
  noPadding: false
})
</script>