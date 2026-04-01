# Agent Orchestration

## Idea

Cortex should feel like a team of specialists working behind the scenes. Instead of one general assistant, a network of agents — each with a clear purpose — collaborate to give better answers, generate content, and surface insights across the user's data.

The user just talks. The system figures out who should respond, whether one agent is enough or several need to work together.

## Layers

**Routing**
A lightweight layer that reads the user's message and decides which agent (or agents) should handle it. No manual selection, no mode switching. See `agent-routing.md`.

**Execution**
Each agent runs with its own context, tools, and personality. Agents don't share state directly — they communicate through structured outputs passed between them.

**Synthesis**
When multiple agents contribute to a response, a final pass merges their outputs into a single coherent reply. The user sees one answer, not a collage.

## Agent roles

**Personal Assistant** — the default. Handles general conversation, reflection, and anything that doesn't match a specialist.

**Code Reviewer** — analyzes repositories, explains architecture, reviews pull requests. Triggered by GitHub links or review requests.

**Finance Analyst** — reasons over transactions, spending patterns, and budget questions. Pulls from the finances module.

**Content Advisor** — helps plan and draft content based on the user's recent activity, interests, and professional profile. Knows what the user has already published to avoid repetition.

**Knowledge Curator** — decides what's worth saving to the second brain. Can be invoked by other agents to persist insights or summaries.

**Researcher** — handles external content: summarizes URLs, analyzes documents, synthesizes information from outside Cortex.

## Content creation pipeline

A specific orchestration flow worth calling out:

```
User activity (GitHub, notes, log entries)
        ↓
Content Advisor analyzes themes and gaps
        ↓
Drafts ideas or full posts
        ↓
Knowledge Curator optionally saves drafts
        ↓
User reviews and publishes externally
```

The data sources that feed this pipeline:
- **GitHub** — public API, reliable, shows what you're actually building
- **Log entries** — what you've been thinking about
- **Knowledge base** — what you've been learning
- **Published content** — what you've already said (to avoid repetition)

LinkedIn, Twitter, and other social platforms are intentionally excluded for now due to API limitations. Content goes out manually; only Cortex-internal data feeds in.

## Open questions

- Should agents be able to invoke other agents, or only the router can dispatch?
- How does the user know which agent responded, and does it matter?
- When synthesis merges multiple agent outputs, how do we avoid losing specificity?
- Where do drafted content pieces live — as knowledge entries, a dedicated store, or ephemeral in chat?
- Should agents have memory across sessions, or start fresh each time?
