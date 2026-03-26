# ChatHistory

Chat history component that displays a list of chat sessions.

## Usage

```vue
<ChatHistory
  :sessions="sessions"
  :active-id="activeSessionId"
  :providers="providers"
  @select="selectSession"
  @delete="deleteSession"
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `sessions` | `Session[]` | Array of chat sessions |
| `activeId` | `number \| null` | Currently active session ID |
| `providers` | `Provider[] \| null` | Available providers for model labels |

### Session

```typescript
interface Session {
  id: number
  title: string | null
  modelProvider: string
  modelName: string
  createdAt: string
}
```

### Provider

```typescript
interface Provider {
  id: string
  name: string
  models: { id: string; name: string }[]
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `id: number` | User clicked on a session |
| `delete` | `id: number` | User clicked delete on a session |

## Features

- Empty state when no sessions exist
- Active session highlighted
- Session title with fallback "New conversation"
- Model label and date for each session
- Delete button on hover (group hover)

## Components Used

- `ButtonsIcon` - Delete button with group hover

## Related Components

- [ButtonsIcon](../buttons/Icon.md)
- [ChatPanel](./ChatPanel.md)