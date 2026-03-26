# ChatHeader

Chat header component with title, provider/model selectors, and action buttons.

## Usage

```vue
<ChatHeader
  title="New Chat"
  v-model:provider="selectedProvider"
  v-model:model="selectedModel"
  :provider-options="providerOptions"
  :model-options="modelOptions"
  :pending-switch="pendingSwitch"
  :show-history="showHistory"
  @confirm-switch="handleConfirm"
  @cancel-switch="handleCancel"
  @toggle-history="toggleView"
  @new-chat="createNew"
  @close="closePanel"
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Header title (session title or "Conversations") |
| `provider` | `string` | Current provider ID (v-model) |
| `model` | `string` | Current model ID (v-model) |
| `providerOptions` | `ProviderOption[]` | Available providers |
| `modelOptions` | `ModelOption[]` | Available models for selected provider |
| `pendingSwitch` | `boolean` | Show confirmation for provider/model switch |
| `showHistory` | `boolean` | Highlight history button when in history view |

### ProviderOption

```typescript
interface ProviderOption {
  label: string  // Display name
  value: string  // Provider ID
}
```

### ModelOption

```typescript
interface ModelOption {
  label: string  // Display name
  value: string // Model ID
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:provider` | `value: string` | Provider changed |
| `update:model` | `value: string` | Model changed |
| `confirm-switch` | - | User confirmed provider switch |
| `cancel-switch` | - | User cancelled provider switch |
| `toggle-history` | - | Toggle between chat and history view |
| `new-chat` | - | Create new chat session |
| `close` | - | Close the chat panel |

## Components Used

- `UiFilterDropdown` - Provider and model selectors
- `ButtonsConfirm` - Switch confirmation
- `ButtonsIcon` - Action buttons (history, new, close)

## Related Components

- [ButtonsIcon](../buttons/Icon.md)
- [ButtonsConfirm](../buttons/Confirm.md)
- [ChatPanel](./ChatPanel.md)