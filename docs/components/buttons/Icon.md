# ButtonsIcon

Icon-only button component for toolbars, action bars, and inline actions.

## Usage

```vue
<template>
  <div class="flex gap-1">
    <ButtonsIcon icon="i-heroicons-clock" title="History" @click="toggleHistory" />
    <ButtonsIcon icon="i-heroicons-plus" title="New" @click="newChat" />
    <ButtonsIcon icon="i-heroicons-x-mark" title="Close" @click="closePanel" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | **required** | Heroicons name (e.g., `i-heroicons-plus`) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `variant` | `'default' \| 'ghost' \| 'danger'` | `'default'` | Visual style |
| `title` | `string` | - | Tooltip text (also used as aria-label) |
| `active` | `boolean` | `false` | Active state styling |
| `groupHover` | `boolean` | `false` | Show only on parent hover (useful for delete buttons) |
| `disabled` | `boolean` | `false` | Disabled state |

## Events

- `click` - Emitted on button click

```typescript
defineEmits<{
  click: [event: MouseEvent]
}>()
```

## Examples

### Toolbar buttons

```vue
<div class="flex items-center gap-1">
  <ButtonsIcon 
    icon="i-heroicons-clock" 
    title="Conversations"
    :active="showHistory"
    @click="toggleView"
  />
  <ButtonsIcon 
    icon="i-heroicons-plus" 
    title="New chat"
    @click="createNewChat"
  />
  <ButtonsIcon 
    icon="i-heroicons-x-mark" 
    title="Close"
    @click="closePanel"
  />
</div>
```

### Delete button with group hover

```vue
<button class="group flex items-center gap-3 hover:bg-white/5">
  <span>Item name</span>
  <ButtonsIcon 
    icon="i-heroicons-trash" 
    variant="danger"
    size="sm"
    groupHover
    title="Delete"
    @click="deleteItem"
  />
</button>
```

### Active state

```vue
<ButtonsIcon 
  icon="i-heroicons-clock"
  :active="isHistoryView"
  title="Toggle view"
/>
```

## Size Reference

| Size | Container | Icon |
|------|-----------|------|
| `sm` | 24x24px | 12x12px |
| `md` | 32x32px | 16x16px |
| `lg` | 40x40px | 20x20px |

## Variant Styles

| Variant | Default | Hover |
|---------|---------|-------|
| `default` | `text-zinc-500` | `text-zinc-300 bg-white/5` |
| `ghost` | `text-zinc-400` | `text-white bg-white/[0.04]` |
| `danger` | `text-zinc-600` | `text-red-400 bg-white/5` |

## Migration from Inline Button

Before:
```vue
<button
  class="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
  title="New chat"
  @click="newChat"
>
  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
</button>
```

After:
```vue
<ButtonsIcon 
  icon="i-heroicons-plus"
  title="New chat"
  @click="newChat"
/>
```