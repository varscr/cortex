# Modal Components

Reusable modal components for Cortex. Located in `components/modals/`.

---

## Overview

| Component | File | Component Name |
|-----------|------|----------------|
| `Confirm` | `Confirm.vue` | `<ModalsConfirm />` |
| `Form` | `Form.vue` | `<ModalsForm />` |

---

## Usage

### Confirm Modal

```vue
<ModalsConfirm
  v-model="showDelete"
  title="Delete Entry"
  message="Are you sure you want to delete this item?"
  confirm-label="Delete"
  @confirm="executeDelete"
/>
```

See [Confirm.md](./Confirm.md) for full documentation.

### Form Modal

```vue
<ModalsForm
  v-model="showModal"
  title="Add Item"
  submit-label="Create"
  @submit="saveItem"
>
  <!-- Form fields -->
  <input v-model="form.name" placeholder="Name" />
</ModalsForm>
```

See [Form.md](./Form.md) for full documentation.

---

## Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls modal visibility (v-model) |
| `title` | `string` | required | Modal header title |

---

## Migration from UiModal

**Before (deprecated)**:
```vue
<UiConfirmModal
  v-model="show"
  title="Confirm"
  message="Are you sure?"
  @confirm="handleConfirm"
/>
```

**After**:
```vue
<ModalsConfirm
  v-model="show"
  title="Confirm"
  message="Are you sure?"
  @confirm="handleConfirm"
/>
```
