# README: NemoClaw Runtime Setup

**KEY QUESTIONS FOR REVIEW:**
- Will NemoClaw's RBAC policies be managed centrally or bundled with the agent Blueprints?
- Do we have a preferred port for the NemoClaw HITL UI?

## Overview

This directory covers the detailed design for **Setup 3: The NemoClaw Runtime**. Designed natively by NVIDIA's ecosystem, it combines deterministic LLM alignment (NeMo Guardrails/Colang) with enterprise-grade operating system sandboxing via NemoClaw's OpenShell hypervisor wrapper.

## How to Spin Up the Architecture

*(Note: Do not execute these steps during the design phase)*

1. Ensure Kata Containers is successfully installed and integrated with Docker on the host. 
2. Pull the NemoClaw Blueprint configurations for the designated local agent scenario.
3. Bring the environment online via Compose:
   ```bash
   docker-compose up -d
   ```
4. This action will initialize OpenClaw inside the sandboxed OpenShell, alongside NeMo Guardrails, and establish a connection to Langfuse.

## Viewing and Interacting with the Agent

- Interaction primarily occurs directly with the deployed agent endpoints.
- Under the hood, NemoClaw executes the agent continuously, utilizing Landlock/seccomp filtering on the OS-level to trap out-of-bounds agent behavior.

## Viewing and Interacting with Policies

- **NeMo Guardrails (Colang):** The cognitive rules governing dialogue flow and grounded generation are defined in raw `.co` files, forming the conversational policy limits.
- **NemoClaw RBAC:** Access control policies are strictly declarative (e.g., matching requested syscalls against a default-deny ruleset).
- **HITL Dashboard:** When NemoClaw intercepts an unexpected API or syscall, it physically pauses execution and requests clearance via its dedicated graphical Human-in-the-Loop Web UI.

## Accessing Logs

- **Split Observability Approach:**
  - **Langfuse:** Navigate to `http://localhost:3000` to trace the LLM logic, node processing, and conversational turns captured directly from the OpenClaw execution.
  - **NemoClaw Audit Logs:** Raw system interventions, blocked syscalls, and HITL resolutions are logged natively by NemoClaw at the host level for rigid, unalterable enterprise auditing. You must manually correlate these streams if trying to trace a hallucination to a blocked host action.

---
*Refer to `architecture_design.md` for deep specifics on the interaction between OpenShell and the Kata container layer.*
