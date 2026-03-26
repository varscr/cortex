# Components

This document provides an overview of all reusable UI components in Cortex.

---

## Directory Structure

```
components/
├── buttons/          # Reusable button components
│   ├── Primary.vue    → <ButtonsPrimary />
│   ├── Secondary.vue  → <ButtonsSecondary />
│   ├── Danger.vue     → <ButtonsDanger />
│   ├── Icon.vue       → <ButtonsIcon />
│   └── Confirm.vue    → <ButtonsConfirm />
├── chat/             # Chat-related components
│   ├── Panel.vue      → <ChatPanel />
│   ├── Header.vue     → <ChatHeader />
│   ├── History.vue    → <ChatHistory />
│   ├── Message.vue    → <ChatMessage />
│   ├── Input.vue      → <ChatInput />
│   └── MarkdownRenderer.vue → <ChatMarkdownRenderer />
├── cards/            # Card components
│   ├── Cards.vue      → <Cards />
│   ├── Modal.vue      → <CardsModal />
│   └── Filter.vue     → <CardsFilter />
├── ui/               # Generic UI components
│   ├── PageHeader.vue    → <UiPageHeader />
│   ├── FilterDropdown.vue → <UiFilterDropdown />
│   ├── TagInput.vue      → <UiTagInput />
│   ├── FormModal.vue     → <UiFormModal />
│   └── ConfirmModal.vue  → <UiConfirmModal />
└── profile/          # Profile section components
    ├── AboutSection.vue    → <ProfileAboutSection />
    ├── SkillsSection.vue   → <ProfileSkillsSection />
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
| `ChatMarkdownRenderer` | Renders markdown content with code highlighting |

See [chat README](./chat/README.md) for detailed documentation.

---

## Cards Components

Located in `components/cards/`

| Component | Purpose |
|-----------|---------|
| `Cards` | Card container with title and padding options |
| `CardsModal` | Modal wrapper for card content |
| `CardsFilter` | Filter bar for card lists |

See [cards README](./cards/README.md) for detailed documentation.

---

## UI Components

Located in `components/ui/`

| Component | Purpose |
|-----------|---------|
| `UiPageHeader` | Page header with title |
| `UiFilterDropdown` | Dropdown selector |
| `UiTagInput` | Tag input component |
| `UiFormModal` | Modal for forms |
| `UiConfirmModal` | Confirmation dialog |

---

## Guidelines

### Creating New Components

1. Place feature-specific components in `components/<feature>/`
2. Place generic reusable components in `components/ui/`
3. Use folder prefix pattern: file `Primary.vue` in `buttons/` → `<ButtonsPrimary />`

### Component Naming

- Use PascalCase for component names
- Nuxt adds folder prefix with `pathPrefix: true` in nuxt.config.ts
- File `buttons/Primary.vue` → component `<ButtonsPrimary />`
- File `chat/Panel.vue` → component `<ChatPanel />`
- File `ui/PageHeader.vue` → component `<UiPageHeader />`

### Props Design

- Use `withDefaults` for optional props with sensible defaults
- Document all props with types
- Emit events using `defineEmits`