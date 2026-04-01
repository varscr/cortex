# Agent Routing

## Idea

Instead of manually selecting which agent handles a message, the chat system should automatically infer the right agent based on what the user is asking.

A user should be able to say "review my GitHub repo" or "parse this PDF" without thinking about which agent to use — the system figures it out.

## How it would feel

- User sends any message in the chat
- The system silently picks the most appropriate agent
- The response comes from that agent's specialized perspective
- Falls back to the default assistant if nothing specific matches

## Agents to build around this

**Default — Personal Assistant**
The existing chat agent. Handles general questions, journal reflection, knowledge lookups, goal tracking. Anything that doesn't match a more specific agent lands here.

**GitHub / Code Review**
Triggered by repo URLs or code review requests. Reviews architecture, explains how things work, points out patterns and issues.

**Finance**
Triggered by finance-related questions: spending analysis, budget questions, transaction lookups. Builds on the existing finances module.

**Document / Research**
Triggered when the user pastes a long text, URL, or asks to summarize/analyze external content.

**Knowledge Capture**
Triggered when the user wants to save something to their second brain — a note, a link, a thought worth keeping.

## What makes this interesting

Each agent has a different personality and focus. The personal assistant is warm and contextual. The code reviewer is technical and direct. The finance agent is analytical. The user never has to switch modes manually — the system does it.

New agents can be added over time without changing the routing logic, as long as each agent clearly describes what it does.

## Open questions

- Should the user be able to see which agent handled their message?
- Should the user be able to override the routing choice?
- How do agents with overlapping scope (e.g. research vs knowledge capture) stay distinct?
