# ChatInput

Chat input component with auto-resizing textarea and send button.

## Usage

```vue
<ChatInput
  v-model="inputText"
  :disabled="sending"
  @send="sendMessage"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | Input text (v-model) |
| `disabled` | `boolean` | `false` | Disable input and send button |

## Events

| Event | Description |
|-------|-------------|
| `update:modelValue` | Emitted on text change |
| `send` | Emitted on Enter key or send button click |

## Features

- Auto-resizing textarea (max 7 rows / 112px)
- Send on Enter key
- Shift+Enter for new line
- Disabled state when sending
- Keyboard hint text

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |

## Components Used

- Native `<textarea>` element
- `UIcon` for send button icon

## Related Components

- [ChatPanel](./ChatPanel.md)