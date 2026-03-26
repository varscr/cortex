# Button Components

Reusable button components for Cortex. Located in `components/buttons/`.

---

## Overview

| Component | File | Description |
|-----------|------|-------------|
| `ButtonsIcon` | `ButtonsIcon.vue` | Icon-only button for toolbars and actions |
| `ButtonsConfirm` | `ButtonsConfirm.vue` | Yes/No confirmation pair |
| `ButtonsPrimary` | `ButtonsPrimary.vue` | Primary action buttons |
| `ButtonsSecondary` | `ButtonsSecondary.vue` | Secondary action buttons |
| `ButtonsDanger` | `ButtonsDanger.vue` | Destructive action buttons |

---

## Usage

### ButtonsIcon

```vue
<ButtonsIcon 
  icon="i-heroicons-plus"
  title="New chat"
  @click="handleClick"
/>
```

See [Icon.md](./Icon.md) for full documentation.

### ButtonsConfirm

```vue
<ButtonsConfirm 
  @confirm="handleConfirm"
  @cancel="handleCancel"
/>
```

See [Confirm.md](./Confirm.md) for full documentation.

### ButtonsPrimary

```vue
<ButtonsPrimary 
  label="Save"
  icon="i-heroicons-check"
  @click="handleSave"
/>
```

See [Primary.md](./Primary.md) for full documentation.

---

## Common Props

All button components share these common props:

| Prop | Type | Description |
|------|------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | Button size |
| `disabled` | `boolean` | Disabled state |
| `loading` | `boolean` | Loading state (where applicable) |

---

## Events

| Event | Description |
|-------|-------------|
| `click` | Emitted on button click |
| `confirm` | Emitted on confirm button click (ButtonsConfirm) |
| `cancel` | Emitted on cancel button click (ButtonsConfirm) |

---

## Styling

All buttons use Tailwind CSS classes and follow the dark theme:

- Text colors: `text-zinc-200` to `text-zinc-500`
- Hover states: `hover:text-zinc-300`, `hover:bg-white/5`
- Active states: `bg-white/5` for selected/active buttons
- Disabled: `opacity-50`, `pointer-events-none`

---

## Migration from Inline Buttons

Before:
```vue
<button
  class="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
  @click="handleClick"
>
  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
</button>
```

After:
```vue
<ButtonsIcon 
  icon="i-heroicons-plus"
  @click="handleClick"
/>
```