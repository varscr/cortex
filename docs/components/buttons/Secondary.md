# ButtonsSecondary

Secondary action button component for cancel, back, and other non-primary actions.

## Usage

```vue
<ButtonsSecondary 
  label="Cancel"
  @click="handleCancel"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Heroicons name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |

## Events

- `click` - Emitted on button click

## Examples

### Cancel button

```vue
<ButtonsSecondary 
  label="Cancel"
  @click="cancelAction"
/>
```

### Back button with icon

```vue
<ButtonsSecondary 
  icon="i-heroicons-arrow-left"
  label="Back"
  @click="goBack"
/>
```

## Styling

- Background: `bg-transparent`
- Border: `border border-white/10`
- Text: `text-zinc-300`
- Hover: `hover:bg-white/[0.04]`
- Disabled: `opacity-50`

## Size Reference

| Size | Padding | Font |
|------|---------|------|
| `sm` | px-3 py-1.5 | text-xs |
| `md` | px-4 py-2 | text-sm |
| `lg` | px-5 py-2.5 | text-base |

## Use Cases

- Cancel buttons in forms
- Back/Return navigation
- Secondary actions in toolbars
- Alternative actions alongside primary buttons