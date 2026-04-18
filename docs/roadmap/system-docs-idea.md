# 🧠 Cortex System & Business Documentation (Idea & Features)

## 🌟 The Vision
To create a centralized "System Hub" within Cortex that acts as a living, interactive Wiki and Feature Log. This area will document business logic, architectural decisions, and chronological feature development. It serves two primary audiences:
1. **You (The Developer/Owner):** For daily reference, tracking achievements, and preparing for future job interviews (knowing exactly *what* you built, *why*, and *how*).
2. **AI Agents (Claude/Cortex Chat):** Providing structured, vectorized context so the AI always understands the codebase's history and business rules.

---

## 🏗️ Proposed UI & Navigation

Introduce a new non-interactive category in the sidebar to separate "Personal/Career" from "System/App" management.

```text
[ SYSTEM ]            <-- New Category
  |-- 📖 Wiki          (Business logic, architecture, setup guides)
  |-- 🚀 Feature Log   (Chronological changelog & technical achievements)
  `-- 📐 Architecture  (Interactive map or high-level system overview)
```

---

## 🎯 Core Features & Modules

### 1. The Business & Technical Wiki (`/system/wiki`)
A hierarchical, Markdown-based documentation space replacing scattered `.md` files in the repo.
*   **Categories:** Business Logic, DevOps/Docker, Database Schema, AI Orchestration.
*   **Rich Text & Markdown:** Use the existing `MarkdownRenderer.vue` to display code blocks, tables, and architecture diagrams (Mermaid.js support).
*   **AI Integration (Crucial):** Every wiki page is automatically chunked and embedded into `pgvector`. When you ask the Chat, *"How does the finance ingestion pipeline work?"*, it retrieves the exact business rules you defined here.

### 2. The Feature & Decision Log (`/system/features`)
A chronological timeline (similar to a Changelog or Architecture Decision Records - ADRs).
*   **Purpose:** To build a repository of "Interview Ammo." When a recruiter asks about a complex problem you solved, you have the exact details.
*   **Data Fields per Entry:**
    *   **Feature Name & Date**
    *   **Business Value:** (e.g., "Automated resume generation to save 5 hours per week.")
    *   **Technical Hurdles:** (e.g., "Implementing @media print` accurately across browsers.")
    *   **Tech Stack Tags:** `#nuxt`, `#pgvector`, `#docker`.
*   **Integration with CV/Portfolio:** In the future, you could flag specific Feature Logs as `is_public` and automatically surface them on your Portfolio's "Case Studies" section.

### 3. Daily Developer Journal (`/system/journal` - Optional)
A frictionless scratchpad for your daily development sessions on Cortex.
*   What did I build today?
*   What bugs am I stuck on?
*   This acts as a brain-dump before you context-switch back to your new day job, making it easy to pick up Cortex development on the weekends.

---

## 💡 Ideas for Claude Code's Implementation Plan

When Claude Code plans this out, it should consider the following technical approaches:

1.  **Database Schema Expansion:**
    *   Create a `system_docs` table (title, content, category, tags, created_at).
    *   Create a `feature_logs` table (title, business_value, technical_details, tags, date).
2.  **Vectorization Hook:**
    *   Ensure that any insert/update to these tables triggers the `server/utils/embed/` pipeline so the Chat agent always has the latest documentation.
3.  **Component Reuse:**
    *   Heavily reuse `NotesList.vue` and `NoteEditor.vue` patterns for the Wiki.
    *   Reuse the timeline/feed design from the `Log` module for the Feature Log.
4.  **File-System Sync (Advanced Idea):**
    *   Could the database Wiki optionally sync down to the physical `docs/` folder in the repo? This would mean the docs live in the app UI *and* in source control.
