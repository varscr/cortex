# CardsPanel

Panel wrapper component for consistent card styling.

## Usage

```vue
<CardsPanel>
  Panel content here
</CardsPanel>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `noPadding` | `boolean` | `false` | Remove padding |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Panel content |

## Examples

### Basic panel wrapper

```vue
<CardsPanel>
  <h3>Panel Title</h3>
  <p>Panel content...</p>
</CardsPanel>
```

### Panel without padding

```vue
<CardsPanel :noPadding="true">
  <div class="p-0">
    Full width content
  </div>
</CardsPanel>
```

## Styling

- Background: `linear-panel`
- Border radius: `rounded-xl`
- Default padding: `overflow-hidden`
- When `noPadding` is true: no additional padding applied

## Note

This component is a simple panel wrapper. It was previously named `CardsModal` but was renamed to better reflect its purpose - it's a styled panel, not a modal. For modal dialogs, use `ModalsConfirm` or `ModalsForm` instead.