# Tag Input Component

Input component for adding/removing tags with keyboard support.

---

## Usage

### Basic Tag Input

```vue
<FormsTagInput v-model="tags" />
```

### With Custom Placeholder

```vue
<FormsTagInput v-model="techStack" placeholder="Add technology..." :lowercase="false" />
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string[]` | required | Array of tags (v-model) |
| `placeholder` | `string` | `'Add tag...'` | Input placeholder text |
| `lowercase` | `boolean` | `true` | Whether to convert tags to lowercase |

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string[]` | Emitted when tags array changes |

---

## Keyboard Interactions

- **Enter** - Add the current input as a new tag
- **Tags are clickable** - Click on a tag to remove it

---

## Example: Tech Stack Input

```vue
<script setup>
const techStack = ref(['Vue', 'TypeScript'])
</script>

<template>
  <label class="text-xs text-zinc-400 block mb-1">Tech stack</label>
  <div class="border border-white/10 rounded-lg px-3 py-2">
    <FormsTagInput v-model="techStack" placeholder="Add tech..." :lowercase="false" />
  </div>
</template>
```

## Example: With Form in Modal

```vue
<script setup>
const form = reactive({
  highlights: [],
  techStack: [],
})
</script>

<template>
  <ModalsForm v-model="modalOpen" title="Add Project" @submit="save">
    <FormsTagInput v-model="form.highlights" placeholder="Add bullet point..." :lowercase="false" />
    <FormsTagInput v-model="form.techStack" placeholder="Add technology..." :lowercase="false" />
  </ModalsForm>
</template>
```

---

## Implementation Details

The component uses the `useTagInput` composable for handling tag logic:

```ts
const { input, add, remove } = useTagInput(tags, { lowercase: props.lowercase })
```

This provides:
- Reactive input binding
- Enter key to add tags
- Click on tag to remove
- Optional lowercase conversion
