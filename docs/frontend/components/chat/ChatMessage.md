# ChatMessage

Chat message component that displays a single message bubble with optional markdown rendering and source citations.

## Usage

```vue
<ChatMessage
  role="assistant"
  :content="message.content"
  :sources="message.sources"
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `role` | `'user' \| 'assistant'` | Message role (determines styling) |
| `content` | `string` | Message content |
| `sources` | `Source[] \| undefined` | RAG sources for assistant messages |

### Source

```typescript
interface Source {
  source: string
  sourceType: string
  title: string
  similarity: number
}
```

## Features

- User messages: Right-aligned, darker background
- Assistant messages: Left-aligned with markdown support
- Source citations: Expandable list for assistant messages
- Shows source type, title, and similarity percentage

## Components Used

- `ChatMarkdownRenderer` - Renders markdown for assistant messages

## Styling

### User Message
- Background: `bg-zinc-700`
- Max width: `85%`
- Text color: `text-zinc-200`

### Assistant Message
- Background: `linear-panel`
- Full width
- Text color: `text-zinc-300`

## Related Components

- [MarkdownRenderer](./MarkdownRenderer.md)
- [ChatPanel](./ChatPanel.md)