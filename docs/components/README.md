# Components

This document provides an overview of all reusable UI components in Cortex.

---

## Directory Structure

```
components/
├── buttons/          # Reusable button components
│   ├── ButtonsIcon.vue
│   ├── ButtonsConfirm.vue
│   ├── ButtonsPrimary.vue
│   ├── ButtonsSecondary.vue
│   └── ButtonsDanger.vue
├── chat/             # Chat-related components
│   ├── ChatPanel.vue
│   ├── ChatHeader.vue
│   ├── ChatHistory.vue
│   ├── ChatMessage.vue
│   ├── ChatInput.vue
│   └── MarkdownRenderer.vue
└── ui/               # Generic UI components
    ├── Button.vue
    ├── Card.vue
    ├── FilterDropdown.vue
    └── ...
```

---

## Button Components

Located in `components/buttons/`

| Component | Purpose | Usage |
|-----------|---------|-------|
| `ButtonsIcon` | Icon-only buttons | Toolbars, header actions, delete buttons |
| `ButtonsConfirm` | Yes/No confirmation pair | Switch confirmations, delete confirmations |
| `ButtonsPrimary` | Primary actions | Add, Save, Submit |
| `ButtonsSecondary` | Secondary actions | Cancel, Back |
| `ButtonsDanger` | Destructive actions | Delete, Remove |

See [buttons README](./buttons/README.md) for detailed documentation.

---

## Chat Components

Located in `components/chat/`

| Component | Purpose |
|-----------|---------|
| `ChatPanel` | Main chat container, orchestrates all child components |
| `ChatHeader` | Title, provider/model selectors, action buttons |
| `ChatHistory` | Session list with selection and deletion |
| `ChatMessage` | Single message bubble with markdown support |
| `ChatInput` | Text input with auto-resize and send button |
| `MarkdownRenderer` | Renders markdown content with code highlighting |

See [chat README](./chat/README.md) for detailed documentation.

---

## UI Components

Located in `components/ui/`

| Component | Purpose |
|-----------|---------|
| `UiButton` | Generic button with variants |
| `UiCard` | Card container with title |
| `UiFilterDropdown` | Dropdown selector |
| `UiTagInput` | Tag input component |
| `UiFormModal` | Modal for forms |
| `UiConfirmModal` | Confirmation dialog |
| `UiPageHeader` | Page header with title |

---

## Guidelines

### Creating New Components

1. Place feature-specific components in `components/<feature>/`
2. Place generic reusable components in `components/ui/`
3. Use the `Buttons*` pattern for button components in `components/buttons/`

### Component Naming

- Use PascalCase for component names
- Prefix generic UI components with `Ui`
- Prefix button components with `Buttons`
- Prefix chat components with `Chat`

### Props Design

- Use `withDefaults` for optional props with sensible defaults
- Document all props with types
- Emit events using `defineEmits`