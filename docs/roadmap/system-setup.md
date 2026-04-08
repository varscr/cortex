# Roadmap: System Configuration & Setup

**Objective:** Create a dedicated "Digital Blueprint" module to store and manage personal computing environment settings, commands, and installation lists.

## 1. Feature Overview
A centralized section within the Profile or a standalone module to document:
- **Helpful Commands:** A library of terminal snippets (Git, Docker, System maintenance).
- **PC Settings:** Configuration details (Display, Sound, Power, BIOS tweaks).
- **Installation Guide:** A checklist of software to install after a clean format (Browsers, IDEs, CLI tools).
- **Dotfiles/Configs:** Links or snippets for `.zshrc`, `.gitconfig`, etc.

## 2. UI/UX Design
- **Main Setup Section:** A high-level dashboard showing categorized cards.
- **Dropdown/Collapse View:** To keep the interface clean, each category (Commands, Settings, Software) will be collapsible.
- **Search & Filter:** Quick lookup for specific commands or settings.
- **Copy-to-Clipboard:** One-click copying for terminal commands.

## 3. Data Structure (Proposed)
- **Table:** `profile_setup`
  - `id`: Primary Key
  - `category`: (e.g., 'Commands', 'Settings', 'Install List')
  - `title`: Short name for the item.
  - `content`: Markdown text for details or the command itself.
  - `tags`: Array of strings for better filtering.
  - `is_favorite`: Boolean for quick access.

## 4. Implementation Tasks
- [ ] **Database:** Add `profile_setup` table to PostgreSQL schema.
- [ ] **Backend:** Implement CRUD API for setup entries.
- [ ] **Frontend Component:** Create `ProfileSetupSection.vue` with dropdown/accordion logic.
- [ ] **Integration:** Add the section to the main Profile page.
- [ ] **Export/Backup:** Ability to export this specific data to a portable JSON or Markdown file.
