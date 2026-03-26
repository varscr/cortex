# CardsModal

Modal content wrapper component for consistent modal styling.

## Usage

```vue
<CardsModal>
  Modal content here
</CardsModal>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `noPadding` | `boolean` | `false` | Remove padding |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Modal content |

## Examples

### Basic modal wrapper

```vue
<CardsModal>
  <h3>Modal Title</h3>
  <p>Modal content...</p>
</CardsModal>
```

### Modal without padding

```vue
<CardsModal :noPadding="true">
  <div class="p-0">
    Full width content
  </div>
</CardsModal>
```

## Styling

- Background: `linear-panel`
- Border radius: `rounded-xl`
- Default padding: `overflow-hidden` (inherits from Cards base)
- When `noPadding` is true: no additional padding applied

## Note

This component is a thin wrapper. For most modal use cases, prefer using Nuxt UI's `<UModal>` component directly, which provides better accessibility and features. CardsModal is useful when you need consistent card styling inside custom modals.