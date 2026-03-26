# Confirm Modal

Confirmation dialog modal with confirm/cancel actions.

---

## Usage

```vue
<ModalsConfirm
  v-model="showDelete"
  title="Delete Entry"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirm-label="Delete"
  confirm-color="red"
  :loading="deleting"
  @confirm="executeDelete"
/>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls modal visibility (v-model) |
| `title` | `string` | required | Modal header title |
| `message` | `string` | required | Confirmation message text |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button label |
| `confirmColor` | `string` | `'red'` | Confirm button color (Nuxt UI colors) |
| `loading` | `boolean` | `false` | Show loading spinner on confirm button |

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when modal should close |
| `confirm` | - | Emitted when user clicks confirm button |

---

## Example: Delete Confirmation

```vue
<script setup>
const showDelete = ref(false)
const deleting = ref(false)

async function executeDelete() {
  deleting.value = true
  await api.deleteItem()
  showDelete.value = false
  deleting.value = false
}
</script>

<template>
  <UButton label="Delete" color="red" @click="showDelete = true" />
  
  <ModalsConfirm
    v-model="showDelete"
    title="Delete Item"
    message="Are you sure you want to delete this item?"
    confirm-label="Delete"
    :loading="deleting"
    @confirm="executeDelete"
  />
</template>
```
