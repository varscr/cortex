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
├── cards/            # Card components
│   ├── Cards.vue      → <Cards />
│   ├── Panel.vue      → <CardsPanel />
│   └── Filter.vue     → <CardsFilter />
├── chat/             # Chat-related components
│   ├── Panel.vue      → <ChatPanel />
│   ├── Header.vue     → <ChatHeader />
│   ├── History.vue    → <ChatHistory />
│   ├── Message.vue    → <ChatMessage />
│   ├── Input.vue      → <ChatInput />
│   └── MarkdownRenderer.vue → <ChatMarkdownRenderer />
├── filters/          # Filter components
│   └── Filter.vue     → <FiltersFilter />
├── forms/            # Form components
│   └── TagInput.vue   → <FormsTagInput />
├── modals/           # Modal components
│   ├── Confirm.vue    → <ModalsConfirm />
│   └── Form.vue       → <ModalsForm />
├── ui/               # Generic UI components
│   └── PageHeader.vue → <UiPageHeader />
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

## Card Components

Located in `components/cards/`

| Component | Purpose |
|-----------|---------|
| `Cards` | Card container with title and padding options |
| `CardsPanel` | Panel wrapper for card content |
| `CardsFilter` | Filter bar for card lists |

See [cards README](./cards/README.md) for detailed documentation.

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

## Filter Components

Located in `components/filters/`

| Component | Purpose |
|-----------|---------|
| `FiltersFilter` | Dropdown filter selector |

See [filters README](./filters/README.md) for detailed documentation.

---

## Form Components

Located in `components/forms/`

| Component | Purpose |
|-----------|---------|
| `FormsTagInput` | Tag input component with add/remove |

See [forms README](./forms/README.md) for detailed documentation.

---

## Modal Components

Located in `components/modals/`

| Component | Purpose |
|-----------|---------|
| `ModalsConfirm` | Confirmation dialog |
| `ModalsForm` | Modal for forms |

See [modals README](./modals/README.md) for detailed documentation.

---

## UI Components

Located in `components/ui/`

| Component | Purpose |
|-----------|---------|
| `UiPageHeader` | Page header with title |

---

## Guidelines

### Creating New Components

1. Place feature-specific components in `components/<feature>/`
2. Use folder prefix pattern: file `Primary.vue` in `buttons/` → `<ButtonsPrimary />`

### Component Naming

- Use PascalCase for component names
- Nuxt adds folder prefix with `pathPrefix: true` in nuxt.config.ts
- File `buttons/Primary.vue` → component `<ButtonsPrimary />`
- File `filters/Filter.vue` → component `<FiltersFilter />`
- File `ui/PageHeader.vue` → component `<UiPageHeader />`

### Props Design

- Use `withDefaults` for optional props with sensible defaults
- Document all props with types
- Emit events using `defineEmits`
