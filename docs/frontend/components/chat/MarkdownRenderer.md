# MarkdownRenderer

Markdown rendering component with GitHub Dark theme code syntax highlighting.

## Usage

```vue
<ChatMarkdownRenderer :content="markdownContent" />
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Markdown content to render |

## Features

- GitHub-Flavored Markdown (GFM) support
- Code syntax highlighting with GitHub Dark theme
- Secure HTML rendering
- Styled for dark theme

### Supported Markdown

- Headings (h1-h6)
- Bold, italic, strikethrough
- Ordered and unordered lists
- Blockquotes
- Code blocks with language detection
- Inline code
- Tables
- Links
- Horizontal rules

## Dependencies

- `marked` - Markdown parser
- `highlight.js` - Code syntax highlighting

## Styling

### Code Blocks
- Theme: GitHub Dark
- Background: `#0d1117`
- Border radius: `6px`
- Horizontal scroll for long lines
- Font: `ui-monospace, monospace`

### Other Elements
- Headings: Bold with bottom border (h1)
- Lists: Proper indentation
- Blockquotes: Left border with muted text
- Links: Blue color with underline

## Related Components

- [ChatMessage](./ChatMessage.md)