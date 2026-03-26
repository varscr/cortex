# Card Components

Reusable card components for Cortex. Located in `components/cards/`.

---

## Overview

| Component | File | Component Name |
|-----------|------|----------------|
| `Cards` | `Cards.vue` | `<Cards />` |
| `CardsFilter` | `Filter.vue` | `<CardsFilter />` |
| `CardsModal` | `Modal.vue` | `<CardsModal />` |

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
  <UiFilterDropdown />
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