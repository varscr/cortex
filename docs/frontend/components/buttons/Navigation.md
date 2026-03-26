# Navigation

This document covers navigation components and patterns in Cortex.

---

## NuxtLink

Nuxt's built-in `<NuxtLink>` component is the standard way to handle navigation in Nuxt 3. It provides:

- **Smart prefetching** - Preloads pages when links are visible
- **Client-side navigation** - Fast transitions without full page reloads
- **External link handling** - Automatically adds `rel="noopener noreferrer"`
- **Active states** - Built-in support for active route styling

### Usage

```vue
<!-- Internal navigation -->
<NuxtLink to="/log">Log</NuxtLink>

<!-- External links -->
<NuxtLink to="https://example.com" external>External</NuxtLink>

<!-- With active class -->
<NuxtLink to="/log" active-class="text-white">Log</NuxtLink>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `to` | `string` | Target route or URL |
| `external` | `boolean` | Force external link rendering |
| `replace` | `boolean` | Replace history entry instead of push |
| `prefetch` | `boolean` | Enable prefetching (default: true) |
| `prefetchOn` | `'visibility' \| 'interaction'` | When to prefetch |

---

## Navigation Patterns in Cortex

### Button Links

For actions that navigate to another page, use `<NuxtLink>` styled as a button:

```vue
<!-- Instead of UiButton with to prop (deprecated) -->
<NuxtLink to="/log" class="text-sm text-zinc-400 hover:text-white transition-colors">
  Cancel
</NuxtLink>
```

### Navigation with Actions

When you need both navigation and an action:

```vue
<NuxtLink to="/log/new">
  <ButtonsPrimary icon="i-heroicons-plus" label="New Entry" />
</NuxtLink>
```

Or use `navigateTo()` in click handlers:

```vue
<ButtonsPrimary icon="i-heroicons-plus" label="New Entry" @click="navigateTo('/log/new')" />
```

---

## Migration from UiButton

**Before (deprecated)**:
```vue
<UiButton to="/log" label="Cancel" variant="ghost" />
```

**After**:
```vue
<NuxtLink to="/log" class="text-sm text-zinc-400 hover:text-white transition-colors">
  Cancel
</NuxtLink>
```

Or with button styling:
```vue
<NuxtLink to="/log">
  <ButtonsSecondary label="Cancel" />
</NuxtLink>
```

---

## Related Components

- [ButtonsPrimary](./Primary.md) - Primary action buttons
- [ButtonsSecondary](./Secondary.md) - Secondary action buttons
- [Nuxt Documentation](https://nuxt.com/docs/api/components/nuxt-link)