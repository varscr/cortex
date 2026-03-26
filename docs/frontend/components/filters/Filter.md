# Filter Component

Custom dropdown filter component with click-outside dismiss.

---

## Usage

### Basic Filter

```vue
<FiltersFilter
  v-model="selectedCategory"
  :options="categoryOptions"
  placeholder="All categories"
/>
```

### With Icon

```vue
<FiltersFilter
  v-model="filter"
  :options="options"
  placeholder="Filter"
  icon="i-heroicons-funnel"
/>
```

### With Custom Option Slot

```vue
<FiltersFilter v-model="filter" :options="categoryOptions">
  <template #option="{ option, isActive }">
    <span class="flex items-center gap-2">
      <UIcon :name="getIcon(option.value)" />
      {{ option.label }}
    </span>
  </template>
</FiltersFilter>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | required | Selected value (v-model) |
| `options` | `Option[]` | required | Array of { label, value } objects |
| `placeholder` | `string` | `'Select...'` | Displayed when no value selected |
| `width` | `string` | `'w-32'` | Button width (Tailwind class) |
| `icon` | `string` | - | Heroicon name to display |
| `iconClass` | `string` | `'text-zinc-500'` | Icon CSS classes |
| `buttonClass` | `string` | - | Additional button classes |
| `textClass` | `string` | - | Additional text span classes |
| `menuClass` | `string` | - | Additional dropdown menu classes |

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when selection changes |

---

## Slots

### option

Custom render for each dropdown option.

```vue
<template #option="{ option, isActive }">
  <span class="flex items-center gap-2">
    <UIcon :name="categoryIcon(option.value)" :class="categoryColor(option.value)" />
    {{ option.label }}
  </span>
</template>
```

**Slot Props:**
- `option` - The option object `{ label, value }`
- `isActive` - Boolean indicating if this option is currently selected

---

## TypeScript Interface

```ts
interface Option {
  label: string
  value: string
}
```

---

## Example: Knowledge Page Filters

```vue
<script setup>
const filterCategory = ref('')
const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
]
</script>

<template>
  <CardsFilter>
    <input v-model="search" placeholder="Search..." />
    <FiltersFilter v-model="filterCategory" :options="CATEGORY_OPTIONS" />
  </CardsFilter>
</template>
```
