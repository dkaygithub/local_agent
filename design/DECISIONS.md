# Architectural Decisions

This document tracks architectural decisions made while reviewing the local agent preparation files.

## Setups & Architectures
* **Goal:** Prepare 2-3 different architectural setups with varying architectures (e.g. evaluating different agent orchestration patterns, runtimes, etc.).
* **Status:** Decision made to build multiple setups.
* **Notes:** All setups will share some common baseline tools (e.g., observability).
  * **Setup 1:** ResonantOS Composite (ResonantOS wrapped in IronCurtain, augmented by LLM Guard for SC/Artifacts and Arize Phoenix for Observability).
  * **Setup 2:** LangGraph Ecosystem (LangGraph for orchestration and HITL, augmented by Bifrost for MCP authorization, Guardrails AI for alignment, and Phoenix for observability).
  * **Setup 3:** NemoClaw Runtime (Securing OpenClaw with OpenShell, augmented by NeMo Guardrails for alignment, LLM Guard for inputs, and Phoenix for tracing).

## Observability & Tracing
* **Framework:** Phoenix (Arize Phoenix)
* **Status:** Decided.
* **Notes:** Confirmed we will use Phoenix for observability on *all* of the 2-3 architectural setups.

## Infrastructure & Environment
* **Platform:** Docker
* **Status:** Decided.
* **Notes:** Comfortable running the setups in Docker; baremetal macOS compatibility is explicitly not a requirement.
* **Dependencies:** Strictly local. No cloud dependencies permitted (e.g., E2B is ruled out).

## Input Security & Data Processing
* **PII Redaction / DLP:** Disabled
* **Status:** Decided.
* **Notes:** Because both setups are fully localized in Docker (guaranteeing data privacy mechanically), we explicitly want the agent to read personal strings. Any input security wrappers (Shield, LLM Guard) are configured to scan only for malicious payloads (Prompt Injection, Jailbreaks) and must disable PII redaction.
