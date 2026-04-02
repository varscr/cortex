# Concept: Autonomous Agent Routing

## Overview
In a complex system like Cortex, the user shouldn't have to know which agent to talk to (e.g., Finance vs. Knowledge vs. Log). Agent Routing is the "Intelligent Front Desk" that analyzes incoming prompts and orchestrates the response by delegating to specialized sub-agents.

## Architecture: The "Supervisor" Pattern

1. Intent Classification: A lightweight "Router Agent" receives the user input. It doesn't have access to all data, only to the metadata/descriptions of other agents.
2. Scoring & Selection: The Router matches the prompt against agent capabilities (defined in agents/*.toml).
3. Delegation: The prompt is forwarded to the selected agent(s).
4. Context Merging (Optional): If a query requires multiple agents (e.g., "Summarize my spending from my latest journal entry"), the Router handles the sequential handoff.
5. Synthesis: The final result is presented to the user as a unified response.

## Why this is a "Product" Feature

### 1. The "Invisible AI" Experience
Most LLM apps make you pick a "GPT" or "Agent." Routing makes the AI feel like a single, omniscient assistant that "just knows" where to look.

### 2. Multi-Agent Collaboration
Routing allows agents to work together. The Finance agent can pass a "Tax Warning" to the Task agent to create a Kanban card automatically.

### 3. Scalability
You can add 100+ specialized agents without overwhelming the UI. The Router acts as the filter, ensuring only the relevant tools are "active" for a specific request.

## Monetization: "The Orchestration Layer"
You can sell Cortex as the Middleware for Private Agents. 
- Enterprise Use: Companies have many "siloed" agents. They pay for the Cortex Router to sit on top and manage the flow of information securely between departments.
- B2B API: Developers pay to use your routing logic to manage their own fleet of specialized agents.

## Implementation Path
- [ ] Create server/utils/agents/router.ts.
- [ ] Implement a "System Prompt" for the Router that lists all available agent name and description.
- [ ] Add a routing_tags field to agents/*.toml to help the Router classify intents more accurately.
- [ ] Update useChatApi to support a "Auto-Route" mode.
