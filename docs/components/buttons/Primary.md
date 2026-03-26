# ButtonsPrimary

Primary action button component for main actions like Save, Submit, Add.

## Usage

```vue
<ButtonsPrimary 
  label="Save"
  icon="i-heroicons-check"
  @click="handleSave"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Heroicons name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `fullWidth` | `boolean` | `false` | Full width button |

## Events

- `click` - Emitted on button click

## Examples

### Save button

```vue
<ButtonsPrimary 
  label="Save"
  icon="i-heroicons-check"
  @click="saveData"
/>
```

### Add button

```vue
<ButtonsPrimary 
  icon="i-heroicons-plus"
  label="Add Item"
  @click="addItem"
/>
```

### Loading state

```vue
<ButtonsPrimary 
  label="Saving..."
  icon="i-heroicons-check"
  :loading="saving"
  :disabled="saving"
/>
```

## Styling

- Background: `bg-white` / `hover:bg-zinc-200`
- Text: `text-zinc-950`
- Disabled: `opacity-50`
- Border radius: `rounded-md`
- Transition: `transition-colors duration-200`

## Size Reference

| Size | Padding | Font |
|------|---------|------|
| `sm` | px-3 py-1.5 | text-xs |
| `md` | px-4 py-2 | text-sm |
| `lg` | px-5 py-2.5 | text-base |