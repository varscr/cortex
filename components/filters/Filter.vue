<template>
  <div class="relative" ref="containerRef">
    <button
      :class="[
        'rounded-lg border transition-all duration-200 flex items-center gap-2',
        buttonClass,
        open ? 'border-white/20' : 'border-white/5 hover:border-white/10'
      ]"
      @click="open = !open"
    >
      <UIcon v-if="icon" :name="icon" class="w-3.5 h-3.5 flex-shrink-0" />
      <span :class="textClass">{{ selectedLabel }}</span>
      <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 flex-shrink-0" />
    </button>
    <div 
      v-if="open" 
      class="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden min-w-full"
      :class="menuClass"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        class="w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2"
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
  icon?: string
  iconClass?: string
  buttonClass?: string
  textClass?: string
  menuClass?: string
}>(), {
  placeholder: 'Select...',
  width: 'w-32',
  iconClass: 'text-zinc-500',
  buttonClass: 'bg-white/5 text-zinc-400 text-xs px-3 py-1.5',
  textClass: 'flex-1 text-left truncate',
  menuClass: 'w-44',
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
