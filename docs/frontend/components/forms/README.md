# Form Components

Reusable form components for Cortex. Located in `components/forms/`.

---

## Overview

| Component | File | Component Name |
|-----------|------|----------------|
| `TagInput` | `TagInput.vue` | `<FormsTagInput />` |

---

## Usage

### Tag Input

```vue
<FormsTagInput v-model="tags" />
```

See [TagInput.md](./TagInput.md) for full documentation.

---

## Migration from UiTagInput

**Before (deprecated)**:
```vue
<UiTagInput v-model="tags" placeholder="Add tag..." />
```

**After**:
```vue
<FormsTagInput v-model="tags" placeholder="Add tag..." />
```
