# ChatPanel

Main chat panel container component that orchestrates all chat-related child components.

## Overview

ChatPanel is the top-level container for the chat interface. It manages state, orchestrates child components, and handles resize interactions.

## Usage

```vue
<ChatPanel />
```

The component is automatically included in the main layout and managed by the `useChatPanel()` composable.

## Props

| Prop | Type | Description |
|------|------|-------------|
| (managed by composable) | - | State managed via `useChatPanel()` |

## Internal Components

ChatPanel composes these child components:

- `ChatHeader` - Title, selectors, actions
- `ChatHistory` - Session list
- `ChatMessage` - Message bubbles
- `ChatInput` - Text input

## State Management

Uses `useChatPanel()` composable for:
- `isOpen` - Panel visibility
- `width` - Panel width
- `toggle` - Toggle function
- `initWidth` / `saveWidth` - Width persistence

## Features

- Resizable panel (drag handle on left edge)
- Toggle visibility
- Width persistence (localStorage)
- View switching (chat/history)

## Related Components

- [ChatHeader](./ChatHeader.md)
- [ChatHistory](./ChatHistory.md)
- [ChatMessage](./ChatMessage.md)
- [ChatInput](./ChatInput.md)