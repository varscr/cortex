# Card Components

Reusable card components for Cortex. Located in `components/cards/`.

---

## Overview

| Component | File | Description |
|-----------|------|-------------|
| `Cards` | `Cards.vue` | Main card component with header, content, footer |
| `CardsFilter` | `CardsFilter.vue` | Filter bar component |
| `CardsModal` | `CardsModal.vue` | Modal content wrapper |

---

## Usage

### Cards (Main Card)

```vue
<Cards title="My Card">
  Card content here
</Cards>
```

See [Cards.md](./Cards.md) for full documentation.

### CardsFilter

```vue
<CardsFilter>
  <input placeholder="Search..." />
  <FilterDropdown />
</CardsFilter>
```

See [CardsFilter.md](./CardsFilter.md) for full documentation.

### CardsModal

```vue
<CardsModal>
  Modal content
</CardsModal>
```

See [CardsModal.md](./CardsModal.md) for full documentation.

---

## Common Props

All card components share these common props:

| Prop | Type | Description |
|------|------|-------------|
| `padding` | `boolean` | Add padding (Cards only, default: true) |
| `noBorder` | `boolean` | Remove border (Cards only) |
| `gap` | `string` | Gap class (CardsFilter only) |
| `noPadding` | `boolean` | Remove padding (CardsModal only) |

---

## Migration from UiCard

**Before (deprecated)**:
```vue
<UiCard title="About">
  Content
</UiCard>
```

**After**:
```vue
<Cards title="About">
  Content
</Cards>
```

**Before (no padding)**:
```vue
<UiCard class="!p-0">
  Content
</UiCard>
```

**After**:
```vue
<Cards :padding="false">
  Content
</Cards>
```