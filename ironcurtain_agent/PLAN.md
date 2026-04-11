# Setup 4: Iron Curtain Personas & Local Agent Architecture

This design outlines a simplified, fully local architecture. Rather than relying on rigid wrappers or orchestrators like ResonantOS, LangGraph, or NemoClaw, this setup leverages **Iron Curtain** as the native orchestrator.

## Proposed Architecture

Per the updated architecture, we will use a **Docker Compose setup** with two containers: one for the agent/LLM backend and a sidecar for the Signal messaging transport.

1. **The Core Engine (Iron Curtain Built-in Agent + Daemon Mode)**
   - Iron Curtain runs in **Daemon Mode** (`ironcurtain daemon`), serving as a long-running background service.
   - It leverages Iron Curtain's built-in features:
     - **Daemon Jobs/Personas**: Support for recurring scheduled cron jobs or on-demand sessions triggered by messages, with independent workspaces and policies.
     - **Memory**: Persistent semantic and keyword memory (`memory-mcp-server`) built right into the agent.
     - **Policy Implementation**: Human-readable constitutions dynamically compiled into deterministic rules enforced at the boundary.

2. **The LLM Backend (Embedded Ollama / Llama 3.1)**
   - The primary container installs Ollama directly alongside Node 22+.
   - A supervisor script (`start.sh`) will start the Ollama daemon and wait for it to be ready.
   - The agent strictly communicates with `localhost:11434` for Llama 3.1 inference.

3. **Signal Messaging Transport**
   - The `signal-cli-rest-api` runs in a separate, dedicated Docker container alongside the agent container.
   - Iron Curtain connects via WebSocket to this REST API container to provide a remote, end-to-end encrypted messaging interface.
   - Users can send tasks, receive agent responses, and approve/deny policy escalations remotely from their Signal app.

4. **Network & Containment**
   - The agent container limits egress as much as possible, connecting to the local isolated network with the Signal REST API container, which has outbound internet access for the Signal servers to transport messages.
   - Code execution is kept natively within the Iron Curtain V8 isolated sandbox ("Code Mode").

## Project Structure

```text
ironcurtain_agent/
├── PLAN.md                   # This implementation plan
├── Dockerfile                # Agent container definition (Node 22, Ollama, IronCurtain)
├── docker-compose.yml        # Orchestration containing the Agent and Signal-CLI services
├── start.sh                  # Entrypoint: Boots Ollama, pulls Llama 3.1, starts Iron Curtain daemon
├── memory/                   # Host-mounted volume for Iron Curtain's semantic memory limits
├── rules/                    # Host-mounted volume containing constitutions and personas
├── signal-data/              # Host-mounted volume attached to Signal container carrying user registration keys
└── ironcurtain/              # Submodule containing the cloned IronCurtain source repository
```

## Security Overview

- **Supply Chain & Execution:** The agent natively executes within an isolated V8 container (Code Mode).
- **Cognitive Alignment & Auth:** Determined directly by Iron Curtain's generated `compiled-policy.json` (from plain English). Read operations are allowed, destructive writes or actions escalate to the user overlay.
- **HITL Integration:** Managed exclusively via the **Signal messaging transport**. When an action is escalated by the policy engine, the user receives an alert with arguments and reason on their phone and must reply `approve` or `deny`.

## Next Steps

1. Review this updated architecture utilizing Docker Compose with the separate Signal REST API sidecar.
2. Write the single `Dockerfile` and `start.sh` entrypoint for the primary Agent/Ollama container.
3. Write `docker-compose.yml` defining the dual container setup, limits, volumes (mapping `/home/user/.ironcurtain` and signal data securely) and GPU enablement.
4. Execute `docker-compose up --build` to instantiate the test Llama 3.1 environment.
5. Provide instructions for initializing and registering the Signal Bot (`npx @provos/ironcurtain setup-signal`).
