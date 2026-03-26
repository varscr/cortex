<template>
  <div class="flex items-center gap-2 min-w-[200px]">
    <div v-if="modelValue.length" class="flex gap-1 flex-wrap">
      <span
        v-for="(tag, i) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
        @click="remove(i)"
      >
        {{ tag }} <span class="opacity-60">&times;</span>
      </span>
    </div>
    <input
      v-model="input"
      :placeholder="placeholder"
      class="bg-transparent border-0 text-sm text-zinc-400 placeholder-zinc-600 outline-none flex-1 min-w-[80px]"
      @keydown.enter.prevent="add"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  lowercase?: boolean
}>(), {
  placeholder: 'Add tag...',
  lowercase: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const tags = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const { input, add, remove } = useTagInput(tags, { lowercase: props.lowercase })
</script>
