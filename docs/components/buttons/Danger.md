# ButtonsDanger

Destructive action button component for dangerous operations like Delete, Remove, or Uninstall.

## Usage

```vue
<ButtonsDanger 
  label="Delete"
  icon="i-heroicons-trash"
  @click="handleDelete"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Heroicons name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `confirm` | `boolean` | `false` | Show confirmation before action |

## Events

- `click` - Emitted on button click
- `confirm` - Emitted when confirm is clicked (if `confirm` prop is true)

## Examples

### Delete button

```vue
<ButtonsDanger 
  label="Delete"
  icon="i-heroicons-trash"
  @click="deleteItem"
/>
```

### Icon only (for list items)

```vue
<ButtonsDanger 
  icon="i-heroicons-trash"
  size="sm"
  @click="deleteItem"
/>
```

### With confirmation

```vue
<ButtonsDanger 
  label="Delete Account"
  icon="i-heroicons-trash"
  :confirm="true"
  @click="showConfirm"
  @confirm="performDelete"
/>
```

## Styling

- Background: `bg-red-600` / `hover:bg-red-500`
- Text: `text-white`
- Disabled: `opacity-50`
- Border radius: `rounded-md`

## Size Reference

| Size | Padding | Font |
|------|---------|------|
| `sm` | px-3 py-1.5 | text-xs |
| `md` | px-4 py-2 | text-sm |
| `lg` | px-5 py-2.5 | text-base |

## Use Cases

- Delete items from lists
- Remove data
- Destructive form actions
- Danger zone actions in settings

## Migration from Inline Buttons

Before:
```vue
<button
  class="text-xs px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
  @click="deleteItem"
>
  Delete
</button>
```

After:
```vue
<ButtonsDanger 
  label="Delete"
  size="sm"
  @click="deleteItem"
/>
```