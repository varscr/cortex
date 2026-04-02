# Cortex Roadmap & Product Vision

## Engineering Roadmap

### Phase 1: Core Consolidation (Current)
- [x] RAG-powered Chat (Nuxt 3 + pgvector)
- [x] Knowledge Ingest (Claude export)
- [x] Finance Parsing (PDF -> SQL)
- [x] Schema Consolidation & Dev Experience

### Phase 2: Autonomous Agent Routing (Next)
**Objective:** Transition from "manual agent selection" to an autonomous orchestration layer.
- [ ] **Intent Classifier:** A lightweight "Front Desk" agent to automatically route queries to specialized agents.
- [ ] **Multi-Agent Handoffs:** Allow the Router to chain requests across different modules (e.g., Log -> Finance).
- [ ] **Context Injection:** Smart injection of relevant module data based on the identified intent.

### Phase 3: Actionable Skillsets (Cortex Plugins)
**Objective:** Enable agents to perform external actions through a modular tool-use architecture.
- [ ] **Tool-Use Registry:** A centralized `server/utils/skills/` for defining functional capabilities (e.g., `web_search`).
- [ ] **Skill Pack Interface:** A standardized format for third-party developers to package and sell "Superpowers."
- [ ] **Human-in-the-Loop:** Confirmation UI for high-impact actions (e.g., executing a bank transfer or deleting a file).

### Phase 4: Ubiquitous Capture
- [ ] **Browser Extension:** One-click "Send to Cortex" for web research.
- [ ] **Mobile "Quick Capture":** Voice-to-text notes and receipt photo uploads.

---

## Monetization Idea 1: "Cortex for Freelancers/Solopreneurs"
*Targeting: High-value business intelligence for one.*
- **Cortex Pro:** SaaS version ($15/mo) with automated tax prep and client memory.

## Monetization Idea 2: "The Plugin Marketplace"
*Targeting: Power users who want specific superpowers.*
- **Skill Packs:** Sell specialized automation modules (e.g., "Lawyer Pack", "DevOps Pack") as standalone plugins.

## Monetization Idea 3: "Enterprise Orchestrator"
*Targeting: Companies with siloed internal agents.*
- **Routing-as-a-Service:** Sell the **Cortex Router** as a secure middleware that manages intent-based routing for corporate agent fleets.

---

## Competitor Landscape

| Competitor | Strength | Cortex's Edge |
| :--- | :--- | :--- |
| **Obsidian** | Local-first notes. | **Native Intelligence:** Cortex is an AI-first OS that *does* work, not just stores it. |
| **Mem.ai** | Auto-organization. | **Transparency:** Open-source core and explicit agent-routing logic. |
| **Rewind.ai** | Records everything. | **Actionable Data:** Parses raw history into structured SQL databases. |

---

## Strategic Positioning
Cortex is **"The Private Orchestration Layer for your Life & Business."** By focusing on **Agent Routing** and **Actionable Skillsets**, we build the foundation for a truly autonomous "Second Brain."
