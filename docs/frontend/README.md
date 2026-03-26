# Frontend Documentation

Frontend documentation for Cortex. Covers Vue components, composables, and frontend architecture.

---

## Directory Structure

```
docs/frontend/
├── components/        # Vue component documentation
│   ├── buttons/       # Button components → <ButtonsPrimary />, etc.
│   ├── cards/        # Card components → <Cards />, etc.
│   ├── chat/         # Chat components → <ChatPanel />, etc.
│   ├── ui/           # Generic UI components → <UiPageHeader />, etc.
│   └── profile/      # Profile sections → <ProfileSkillsSection />, etc.
└── composables/      # Composables documentation (coming soon)
```

---

## Components

Documentation for reusable Vue components:

- [Buttons](./components/buttons/README.md) - Button components (ButtonsPrimary, ButtonsIcon, etc.)
- [Cards](./components/cards/README.md) - Card components (Cards, CardsFilter, CardsModal)
- [Chat](./components/chat/README.md) - Chat UI components (ChatPanel, ChatMessage, etc.)

---

## Composables

Documentation for Vue composables:

| Composable | Location | Purpose |
|------------|----------|---------|
| `useChatPanel()` | `composables/chat/useChatPanel.ts` | Panel open/width state |
| `useChatState()` | `composables/chat/useChatState.ts` | Session, provider, model state |
| `useChatApi()` | `composables/chat/useChatApi.ts` | API calls (send, create, delete) |
| `useChatFormatters()` | `composables/chat/useChatFormatters.ts` | formatLabel, formatDate |
| `useMarkdown()` | `composables/chat/useMarkdown.ts` | Markdown parsing |
| `useSidebar()` | `composables/useSidebar.ts` | Sidebar collapse state |
| `useTagInput()` | `composables/useTagInput.ts` | Tag input handling |
| `useFormatDate()` | `composables/useFormatDate.ts` | Date formatting |

---

## Related Documentation

- [RAG Documentation](../rag/README.md) - Knowledge base and RAG system