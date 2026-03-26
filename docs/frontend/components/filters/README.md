# Filter Components

Reusable filter components for Cortex. Located in `components/filters/`.

---

## Overview

| Component | File | Component Name |
|-----------|------|----------------|
| `Filter` | `Filter.vue` | `<FiltersFilter />` |

---

## Usage

### Filter Dropdown

```vue
<FiltersFilter
  v-model="filterCategory"
  :options="categoryOptions"
  placeholder="All categories"
/>
```

See [Filter.md](./Filter.md) for full documentation.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | required | Selected value (v-model) |
| `options` | `Option[]` | required | Array of { label, value } |
| `placeholder` | `string` | `'Select...'` | Placeholder text when no selection |
| `width` | `string` | `'w-32'` | Button width class |
| `icon` | `string` | - | Icon name to display |
| `iconClass` | `string` | `'text-zinc-500'` | Icon CSS classes |
| `buttonClass` | `string` | - | Additional button classes |
| `textClass` | `string` | - | Additional text classes |
| `menuClass` | `string` | - | Additional dropdown menu classes |

---

## Migration from UiFilterDropdown

**Before (deprecated)**:
```vue
<UiFilterDropdown
  v-model="filter"
  :options="options"
  placeholder="Filter..."
/>
```

**After**:
```vue
<FiltersFilter
  v-model="filter"
  :options="options"
  placeholder="Filter..."
/>
```
