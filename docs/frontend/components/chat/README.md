# Chat Components

Chat-related Vue components for the Cortex AI assistant interface.

---

## Overview

```
components/chat/
├── Panel.vue              → <ChatPanel />
├── Header.vue             → <ChatHeader />
├── History.vue            → <ChatHistory />
├── Message.vue            → <ChatMessage />
├── Input.vue              → <ChatInput />
└── MarkdownRenderer.vue   → <ChatMarkdownRenderer />
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
| [ChatMarkdownRenderer](./MarkdownRenderer.md) | Renders markdown with code highlighting |

---

## Composables

Chat functionality is split into composables in `composables/chat/`:

```
composables/chat/
├── useChatPanel.ts      → Panel open/width state
├── useChatState.ts     → Session, provider, model state
├── useChatApi.ts       → API calls (send, create, delete)
├── useChatFormatters.ts → formatLabel, formatDate
└── useMarkdown.ts      → Markdown parsing
```

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

- [Button Components](../buttons/README.md)
- [RAG Documentation](../../rag/README.md)