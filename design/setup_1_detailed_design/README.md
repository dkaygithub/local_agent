# README: ResonantOS Architecture Setup

**KEY QUESTIONS FOR REVIEW:**
- Do we plan to expose IronCurtain configurations through a unified UI, or keep it strictly CLI/file-based?
- Will the Kata Containers runtime be running on a dedicated Linux host or a managed service?

## Overview

This directory contains the detailed design and implementation plans for **Setup 1: The Resonant Curtain (Composite)**. This setup employs a heavy defense-in-depth architecture anchored by ResonantOS with surrounding boundary enforcements (IronCurtain, Trivy, LLM Guard).

## How to Spin Up the Architecture

*(Note: Do not execute these steps during the design phase)*

1. Ensure the host is running a kernel and Docker daemon compatible with **Kata Containers**.
2. Run standard pre-flight scans using Trivy on the provided Docker image schemas:
   ```bash
   trivy image --severity HIGH,CRITICAL resonantos-agent:latest
   ```
3. Initialize the environment utilizing Docker Compose to automatically enforce the `None` network mode on the agent and spin up the supporting proxy layers:
   ```bash
   docker-compose up -d
   ```

## Viewing and Interacting with the Agent

- The primary interface for internal state is the **ResonantOS Mission Control dashboard**.
- It provides oversight on the agent's memory (Archivist), logical processing flow (Logician), and prompt filtering metrics (Shield).
- Navigate to the designated Mission Control local port (e.g., `http://localhost:8080`) to view active agents in the fleet.

## Viewing and Interacting with Policies

- **Input Security/Shield Layer:** Policies are defined as YARA rules loaded at runtime into ResonantOS.
- **Cognitive Routing:** Policies are strict Datalog routing constraints defined within the ResonantOS Logician engine.
- **Network Boundaries:** IronCurtain handles API key swaps and HTTP proxying; these policies are configured via local `ironcurtain.yaml` files holding the allowlisted endpoints and exact token swappings.

## Accessing Logs

- **ResonantOS Native Logging:** Handled by the Guardian. Expect structured JSONL logs regarding deterministic constraint tracking and internal agent warnings.
- **Audit Logging and External Calls:** All external traffic from the agent funneling through the Unix socket to IronCurtain is systematically written to IronCurtain's proxy access logs.

---
*Refer to the `architecture_design.md` file in this directory for more in-depth operational blueprints.*
