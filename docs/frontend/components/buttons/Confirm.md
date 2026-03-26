# ButtonsConfirm

Confirmation button pair component for Yes/No or Confirm/Cancel actions.

## Usage

```vue
<template>
  <ButtonsConfirm 
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `confirmText` | `string` | `'Yes'` | Text for confirm button |
| `cancelText` | `string` | `'No'` | Text for cancel button |
| `size` | `'sm' \| 'md' \| 'lg'` | inherited | Button size (not implemented yet) |

## Events

- `confirm` - Emitted when confirm button is clicked
- `cancel` - Emitted when cancel button is clicked

```typescript
defineEmits<{
  confirm: []
  cancel: []
}>()
```

## Examples

### Basic usage (Switch provider confirmation)

```vue
<template>
  <div v-if="pendingSwitch">
    <span class="text-xs text-amber-400">Switch provider?</span>
    <ButtonsConfirm 
      @confirm="confirmSwitch"
      @cancel="cancelSwitch"
    />
  </div>
</template>
```

### Custom text

```vue
<ButtonsConfirm 
  confirmText="Delete"
  cancelText="Keep"
  @confirm="deleteItem"
  @cancel="keepItem"
/>
```

### With parent state

```vue
<template>
  <div v-if="showConfirm" class="flex items-center gap-2">
    <span class="text-sm text-zinc-400">Are you sure?</span>
    <ButtonsConfirm 
      confirmText="Yes, delete"
      cancelText="Cancel"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
const showConfirm = ref(false)
</script>
```

## Styling

### Confirm Button (Amber)
- Default: `bg-amber-500/20 text-amber-400`
- Hover: `bg-amber-500/30`

### Cancel Button (Gray)
- Default: `bg-zinc-700 text-zinc-400`
- Hover: `bg-zinc-600`

### Layout
- Inline layout with `flex items-center gap-2`
- Text size: `text-xs`
- Padding: `px-2 py-0.5`
- Border radius: `rounded`

## Migration from Inline Buttons

Before:
```vue
<div v-if="pendingSwitch" class="flex items-center gap-2 mt-1.5">
  <span class="text-xs text-amber-400">Switch provider?</span>
  <button
    class="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
    @click="$emit('confirm-switch')"
  >
    Yes
  </button>
  <button
    class="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400 hover:bg-zinc-600 transition-colors"
    @click="$emit('cancel-switch')"
  >
    No
  </button>
</div>
```

After:
```vue
<ButtonsConfirm
  v-if="pendingSwitch"
  @confirm="$emit('confirm-switch')"
  @cancel="$emit('cancel-switch')"
/>
```