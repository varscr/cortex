# CardsFilter

Filter bar component for search and filtering interfaces.

## Usage

```vue
<CardsFilter>
  <input placeholder="Search..." />
  <FilterDropdown />
</CardsFilter>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `string` | `'gap-3'` | Tailwind gap class for spacing |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Filter elements (inputs, dropdowns, etc.) |

## Examples

### Basic filter bar

```vue
<CardsFilter>
  <input v-model="search" placeholder="Search..." />
  <UiFilterDropdown v-model="filter" :options="options" />
</CardsFilter>
```

### Filter bar with custom gap

```vue
<CardsFilter gap="gap-4">
  <!-- elements -->
</CardsFilter>
```

### Filter bar with right-aligned element

```vue
<CardsFilter>
  <input placeholder="Search..." />
  <FilterDropdown />
  <span class="ml-auto text-xs text-zinc-500">{{ count }} items</span>
</CardsFilter>
```

## Styling

- Background: `linear-panel`
- Border radius: `rounded-xl`
- Padding: `p-3`
- Layout: `flex flex-wrap items-center`
- Default gap: `gap-3` (configurable via `gap` prop)