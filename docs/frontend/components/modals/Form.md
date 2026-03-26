# Form Modal

Modal dialog for form input with submit/cancel actions.

---

## Usage

```vue
<ModalsForm
  v-model="showModal"
  title="Add Skill"
  submit-label="Add"
  :loading="saving"
  @submit="saveSkill"
>
  <input v-model="form.name" placeholder="Skill name" />
  <select v-model="form.category">
    <option value="frontend">Frontend</option>
    <option value="backend">Backend</option>
  </select>
</ModalsForm>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls modal visibility (v-model) |
| `title` | `string` | required | Modal header title |
| `submitLabel` | `string` | `'Save'` | Submit button label |
| `loading` | `boolean` | `false` | Show loading spinner on submit button |

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when modal should close |
| `submit` | - | Emitted when form is submitted |

---

## Slots

| Slot | Description |
|------|-------------|
| `default` | Form content (inputs, selects, etc.) |

---

## Example: Profile Form

```vue
<script setup>
const modalOpen = ref(false)
const saving = ref(false)
const form = reactive({ name: '', category: '' })

async function save() {
  saving.value = true
  await api.saveSkill(form)
  saving.value = false
  modalOpen.value = false
}
</script>

<template>
  <ButtonsPrimary label="Add Skill" @click="modalOpen = true" />
  
  <ModalsForm
    v-model="modalOpen"
    title="Add Skill"
    submit-label="Add"
    :loading="saving"
    @submit="save"
  >
    <input
      v-model="form.name"
      placeholder="Skill name"
      class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
    />
    <select v-model="form.category" class="...">
      <option value="frontend">Frontend</option>
      <option value="backend">Backend</option>
    </select>
  </ModalsForm>
</template>
```
