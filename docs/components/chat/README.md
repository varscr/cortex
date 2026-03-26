# Chat Components

Chat-related Vue components for the Cortex AI assistant interface.

---

## Overview

```
components/chat/
├── ChatPanel.vue          # Main container
├── ChatHeader.vue         # Header with selectors and actions
├── ChatHistory.vue        # Session list
├── ChatMessage.vue        # Message bubble with markdown
├── ChatInput.vue          # Text input with send
└── MarkdownRenderer.vue   # Markdown rendering with code highlighting
```

---

## Components

| Component | Purpose |
|-----------|---------|
| [ChatPanel](./ChatPanel.md) | Main chat container, orchestrates all child components |
| [ChatHeader](./ChatHeader.md) | Title, provider/model selectors, action buttons |
| [ChatHistory](./ChatHistory.md) | Session list with selection and deletion |
| [ChatMessage](./ChatMessage.md) | Single message bubble with markdown support |
| [ChatInput](./ChatInput.md) | Text input with auto-resize and send button |
| [MarkdownRenderer](./MarkdownRenderer.md) | Renders markdown with code highlighting |

---

## Architecture

See [docs/chat/README.md](../../chat/README.md) for the complete chat system architecture, including:
- API endpoints
- Database schema
- RAG context
- LLM providers

---

## Usage

### ChatPanel (Main Component)

```vue
<ChatPanel />
```

The ChatPanel is automatically included in the main layout and managed by `useChatPanel()` composable.

### Child Components

Child components are typically used within ChatPanel:

```vue
<template>
  <div>
    <ChatHeader v-bind="headerProps" />
    <ChatHistory v-bind="historyProps" />
    <div v-for="msg in messages">
      <ChatMessage v-bind="msg" />
    </div>
    <ChatInput v-model="input" @send="sendMessage" />
  </div>
</template>
```

---

## Related Documentation

- [Chat API Documentation](../../chat/README.md)
- [Button Components](../buttons/README.md)
- [RAG Documentation](../../rag/README.md)