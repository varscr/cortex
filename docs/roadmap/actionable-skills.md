# Concept: Actionable Skills (Tool-Use)

## Overview
If **Agent Routing** is the "Brain" that decides *who* should handle a task, **Actionable Skills** are the "Hands" that actually execute it. This feature moves Cortex from a passive RAG (Retrieval-Augmented Generation) system to an active **Agentic OS** capable of interacting with the real world.

## The "Feel": From Assistant to Operator

Instead of just asking questions, you issue **Directives**:

*   **User:** "I just got an email about my utility bill. Can you handle it?"
*   **Cortex (via Router):** Identifies the intent and calls the `email-fetch` skill.
*   **Cortex:** "I found the bill from Enel for $45. Your current balance is $1,200. Should I pay it using your primary credit card?"
*   **User:** "Yes, go ahead."
*   **Cortex (via Skill):** Executes the `web-payment` skill, logs the transaction in the `finance` module, and adds a "Payment Successful" note to your `journal`.

## Architecture: The "Tool-Use" Registry

1.  **Skill Definition:** Every skill is a modular TypeScript function with a strict JSON Schema definition (OpenAI/Claude tool format).
2.  **Capability Discovery:** When an agent is activated, it is "granted" a set of skills based on its role (e.g., the Finance Agent gets `read-pdf` and `bank-query`).
3.  **The Action Loop:**
    *   **Call:** The LLM generates a `tool_use` request.
    *   **Guardrail:** The system checks if the skill requires **Human-in-the-Loop (HITL)** approval.
    *   **Execute:** The server runs the local code (e.g., calling a Puppeteer script or a REST API).
    *   **Observe:** The result is fed back to the LLM to complete the conversation.

## Why this is a "Product" Feature

### 1. Unified Action Layer
Instead of having 20 different apps for 20 different tasks, Cortex becomes the single command line for your life.

### 2. Cross-App Automation
Skills aren't limited to one module. A `calendar-sync` skill can be used by the `log` agent to turn journal entries into scheduled events automatically.

### 3. Permissioned Autonomy
The system can be configured with "Safe Skills" (e.g., `read-only-search`) and "High-Stakes Skills" (e.g., `execute-transfer`), giving users full control over what the AI can actually do.

## Monetization: "The Power-Up Model"
- **Skill Marketplace:** Independent developers can build and sell "Skill Packs" (e.g., a "Crypto-Trading Pack" or a "Real Estate Research Pack").
- **Premium Integrations:** Charge for "Pro Skills" that connect to complex enterprise APIs (Salesforce, SAP, etc.).

## Implementation Path
- [ ] Define the `Skill` interface in `server/utils/skills/types.ts`.
- [ ] Implement a `executeSkill` runner that handles authentication and error logging.
- [ ] Build the **Action UI** in Nuxt: A specialized chat component that renders "Pending Actions" (Buttons/Forms) for user approval.
- [ ] Create the first core skill: `web_search` (using Tavily or Serper) to give agents real-time internet access.
