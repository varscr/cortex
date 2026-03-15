# Chat Agent — Future Design

## Overview
Conversational AI agent with RAG across all Cortex modules (log, knowledge, trading, finances). Uses pgvector semantic search to provide context-aware responses grounded in your personal data.

## Architecture

### Agent Config
New `agents/chat.toml` with a system prompt instructing the LLM to:
- Answer questions using retrieved context
- Cite sources (log entries, knowledge entries, etc.)
- Maintain conversation history within a session

### RAG Pipeline
1. User sends a message
2. Embed the message using OpenAI `text-embedding-3-small`
3. Query `documents` table: `SELECT * FROM documents WHERE embedding <=> $1 ORDER BY embedding <=> $1 LIMIT 10`
4. Build context from top results (across all `source_type` values: log, knowledge, etc.)
5. Send message + context to agent
6. Return response + source references

### API
- `POST /api/agents/chat/message` — send message, get response
- `GET /api/agents/chat/sessions` — list chat sessions
- `GET /api/agents/chat/sessions/:id` — get session with message history

### DB
Chat sessions and messages table (to be designed when implementing):
- `chat_sessions` — id, title, created_at
- `chat_messages` — id, session_id, role, content, sources (JSONB), created_at

### UI
- Chat panel in Cortex sidebar or dedicated page
- Message bubbles with source citations (clickable links to log/knowledge entries)
- Streaming responses via SSE

## Prerequisites
- Knowledge ingest agent (provides the knowledge base)
- Embeddings working for all modules
- Streaming support in LLM driver (`stream()` method)

## Implementation Order
1. Add `stream()` to `LlmDriver` interface
2. Implement SSE streaming in Claude CLI driver
3. Create chat agent TOML config
4. Build RAG retrieval utility
5. Create chat API endpoints
6. Build chat UI component
