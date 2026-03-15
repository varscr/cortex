<template>
  <div class="relative" ref="containerRef">
    <button
      :class="['bg-white/5 text-sm text-zinc-400 rounded-lg px-3 py-1.5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between', width]"
      @click="open = !open"
    >
      <span :class="modelValue ? 'text-zinc-300' : ''">{{ selectedLabel }}</span>
      <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5" />
    </button>
    <div v-if="open" class="absolute top-full left-0 mt-1 w-44 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="w-full text-left px-3 py-1.5 text-sm transition-colors"
        :class="modelValue === opt.value ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'"
        @click="select(opt.value)"
      >
        <slot name="option" :option="opt" :is-active="modelValue === opt.value">
          {{ opt.label }}
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  width?: string
}>(), {
  placeholder: 'Select...',
  width: 'w-40',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const containerRef = ref<HTMLElement>()

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : props.placeholder
})

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
