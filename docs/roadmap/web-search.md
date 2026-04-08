# Roadmap: Web Search & Agent Permissions

## Overview
Enable the Cortex chat agent to browse the internet for real-time information (company research, documentation, news).

## Tasks
- [ ] **Infrastructure**
    - [ ] Create `server/utils/skills/web-search.ts` using a search API (Tavily, Serper, or Brave Search).
    - [ ] Implement a standardized `Skill` interface for agent tool calls.

- [ ] **LLM Driver Configuration**
    - [ ] Update `ClaudeCliDriver` to allow tool execution.
    - [ ] **Security Fix:** Resolve the "root/sudo" restriction in Docker when using `--dangerously-skip-permissions`.
    - [ ] Explore non-root Docker user configuration for the `claude` CLI.

- [ ] **UI/UX**
    - [ ] Add a "Web Search" toggle to the chat input component.
    - [ ] Implement "Thinking..." indicators when the agent is browsing.
    - [ ] Render search sources/citations in the chat message component.

## Security Considerations
- Ensure the agent cannot access local files while in "bypass permissions" mode.
- Sanitize all data returned from external web fetches.
