import type { Ref } from 'vue'

export function useTagInput(tags: Ref<string[]>, options?: { lowercase?: boolean }) {
  const lowercase = options?.lowercase ?? true
  const input = ref('')

  function add() {
    let tag = input.value.trim()
    if (lowercase) tag = tag.toLowerCase()
    if (tag && !tags.value.includes(tag)) {
      tags.value.push(tag)
    }
    input.value = ''
  }

  function remove(index: number) {
    tags.value.splice(index, 1)
  }

  return { input, add, remove }
}
