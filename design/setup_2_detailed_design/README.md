# README: LangGraph Ecosystem Setup

**KEY QUESTIONS FOR REVIEW:**
- What local LLM model will run behind Bifrost for LangGraph to query?
- How will we handle state persistence for LangGraph (e.g., SQLite volume mounting vs. local instance)?

## Overview

This directory contains the detailed design for **Setup 2: The LangGraph Ecosystem**. It features a modern agentic approach using LangGraph for state management, while offloading security and observability to local specialized components like Bifrost (Go gateway), Guardrails AI, LLM Guard, and Langfuse for observability tracing.

## How to Spin Up the Architecture

*(Note: Do not execute these steps during the design phase)*

1. Navigate to the project directory and verify the LLM Guard schemas and Langfuse environment configs.
2. Initialize the environment with Docker Compose. This starts the LangGraph Python executor, the Bifrost Go gateway, and the Langfuse trace instance:
   ```bash
   docker-compose up -d
   ```
3. LangGraph will connect to the internal `bifrost:8000` context for executing tools over MCP.

## Viewing and Interacting with the Agent

- The LangGraph agent runs statelessly in terms of short-term LLM generation, but persists checkpointer state to a local SQLite database or Postgres instance (defined in your LangGraph setup).
- Interaction typically occurs via the local CLI exposed in the primary python script, or through a custom local frontend interacting with the LangGraph REST endpoints.

## Viewing and Interacting with Policies

- **Guardrails.ai (Cognitive Alignment):** Policies are purely code-based. Review the Pydantic classes and `validate()` checks inside the Python files for LangGraph nodes.
- **Bifrost (Authorization Gateway):** Review the YAML/JSON definitions used by Bifrost for Virtual Key constraints and MCP tool authorization scopes.
- **Human-in-the-Loop (HITL):** Managed natively by LangGraph checkpoints. You must use the LangGraph interrupt command (via Python SDK or frontend wrapper) to approve tool usage.

## Accessing Logs

- **Langfuse Unified Dashboard:** Navigate to `http://localhost:3000` to view coalesced traces. LangGraph native traces and Bifrost Go (OpenTelemetry payload) traces will appear seamlessly linked via HTTP `traceparent` headers.

---
*Refer to the `architecture_design.md` file in this directory for component interaction specifics.*
