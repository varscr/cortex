# Idea: Chat Debug Center & Diagnostic Wrapper

## Overview
The "Chat Debug Center" is a dedicated, real-time diagnostic dashboard designed to wrap the core chat implementation. Its primary goal is to provide complete visibility into the AI's "thought process," network streaming, and agent orchestration. By removing the "blindness" of the polished user interface, developers can inspect raw data, optimize performance, and troubleshoot complex multi-agent interactions.

## Core Objectives
*   **Total Transparency:** Expose every piece of data exchanged between the client and the LLM/Agent backend.
*   **Performance Profiling:** Track latency, streaming speeds, and token consumption in real-time.
*   **State Management:** Visualize the context window and agent state at any given turn.

## Key Features & Capabilities

### 1. Raw Stream & Chunk Inspection
*   **Live Chunk Log:** A scrolling terminal-like view showing raw incoming JSON chunks as they arrive over the network (e.g., SSE or WebSockets).
*   **Chunk Metadata:** Display hidden metadata attached to chunks, such as finish reasons (e.g., `stop`, `length`, `tool_call`), safety ratings, and log probabilities (if available).
*   **Malformed Data Catching:** Highlight and isolate chunks that fail to parse or break the expected schema, rather than silently failing.

### 2. Context & Payload Visibility
*   **Prompt Inspector:** A dedicated panel showing the *exact* final payload sent to the API, including the system prompt, history, injected context, and tool definitions.
*   **Token Counting:** Real-time estimates or exact counts of prompt tokens, completion tokens, and total session tokens.
*   **Context Compaction Triggers:** Visual indicators showing when the conversation history is summarized or truncated to fit token limits.

### 3. Agent Orchestration & Tool Tracking
*   **Tool Call Lifecycle:** Visual representation of when an agent decides to call a tool, the exact arguments passed, the duration of the tool execution, and the raw output returned to the agent.
*   **State Transitions:** For multi-agent systems, a visual graph or timeline showing hand-offs between different specialized agents (e.g., "Router Agent" -> "Search Agent" -> "Writer Agent").
*   **Thought/Reasoning Chains:** If using Chain-of-Thought or reasoning models, a separate panel to display the internal reasoning process before the final answer is streamed to the main UI.

### 4. Performance & Network Metrics
*   **Time To First Token (TTFB):** Measure and display the initial latency before the first chunk arrives.
*   **Tokens Per Second (TPS):** A live speedometer showing the generation speed.
*   **Total Request Duration:** End-to-end timing for each interaction.

### 5. Advanced Debugging Tools
*   **Split-Screen / Overlay Mode:** A toggle to view the polished "User View" side-by-side with the "Debug View" to see how raw data translates to UI elements.
*   **Session Replay/Export:** The ability to export the entire session (including all raw chunks and states) as a JSON file, and a "Replay" feature to step through a past conversation locally without hitting the API again.
*   **Mock Injection:** Tools to manually inject a mock chunk or tool response to test how the UI handles specific edge cases (e.g., errors, specific finish reasons).

## Recommended UI Layout Structure
*   **Left Panel:** The standard Chat UI (what the end-user sees).
*   **Middle Panel (The Log):** The continuous stream of raw chunks, tool executions, and state changes.
*   **Right Panel (The Inspector):** Static details for the currently selected interaction (Payload sent, full context window, token metrics).

## Why this is valuable for Claude Code (or any planner)
This document outlines the *requirements* and *developer experience (DX)* goals. When planning the implementation, the planner should focus on:
1.  How to intercept the stream without modifying the core chat logic (e.g., using a Proxy, wrapper classes, or event emitters).
2.  How to store this diagnostic data in memory without causing memory leaks during long sessions.
3.  Choosing the right UI components (JSON viewers, timeline charts) to make the data digestible.
