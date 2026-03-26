# Cards

Main card component with header, content, and footer sections.

## Usage

```vue
<Cards title="Card Title">
  Card content here
</Cards>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `description` | `string` | - | Title description |
| `padding` | `boolean` | `true` | Add padding to content area |
| `noBorder` | `boolean` | `false` | Remove border |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main content |
| `header` | Custom header content (replaces title) |
| `actions` | Header actions (buttons) |
| `footer` | Footer content |

## Examples

### Basic card

```vue
<Cards title="My Profile">
  <p>Content goes here</p>
</Cards>
```

### Card with actions

```vue
<Cards title="Projects">
  <template #actions>
    <ButtonsPrimary icon="i-heroicons-plus" size="sm" label="Add" />
  </template>
  <div>Project list...</div>
</Cards>
```

### Card without padding

```vue
<Cards :padding="false">
  <div class="divide-y">
    Item 1
    Item 2
  </div>
</Cards>
```

### Card with footer

```vue
<Cards title="Summary">
  Content here
  <template #footer>
    <span class="text-xs text-zinc-500">Last updated: today</span>
  </template>
</Cards>
```

## Styling

- Background: `linear-panel`
- Border radius: `rounded-xl`
- Border: `border-white/5` (optional with `noBorder`)
- Header: `px-6 py-5 border-b border-white/5`
- Content: `p-6` (when `padding` is true)
- Footer: `px-6 py-4 bg-white/[0.02] border-t border-white/5`

## Migration from UiCard

**Before**:
```vue
<UiCard title="About">...</UiCard>
```

**After**:
```vue
<Cards title="About">...</Cards>
```

**Before (no padding)**:
```vue
<UiCard class="!p-0">...</UiCard>
```

**After**:
```vue
<Cards :padding="false">...</Cards>
```