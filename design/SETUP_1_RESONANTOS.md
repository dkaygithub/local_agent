# Architecture Setup 1: The Resonant Curtain (Composite)

This setup represents a sophisticated, deeply nested defense-in-depth architecture. It anchors on **ResonantOS** for its deterministic cognitive engine, but surrounds it with hard boundaries (IronCurtain), artifact validation (LLM Guard), and deep tracing (Arize Phoenix).

This architecture is entirely local, running within Docker, and relies on absolutely zero cloud dependencies.

---

## 🏗️ The Tech Stack

1. **Trivy + LLM Guard:** Trivy acts as the pre-flight scanner for poisoned Python/OS dependencies, while LLM Guard handles local model artifact security and runtime prompt scanning.
2. **ResonantOS:** The core cognitive engine. Handles deterministic policy enforcement (Logician) and prompt filtering (Shield).
3. **IronCurtain:** The strict outer wrapper. Provides credential separation, network isolation, and escalation routing.
4. **ResonantOS Mission Control:** The native dashboard for tracking agent fleet status, incident logs, and token usage via the Guardian.

---

## 🛡️ The 7-Layer Security Coverage

### 1. Supply Chain Security
**Status:** ✅ Covered
**Component:** **Trivy + LLM Guard**
**How it works:** Before the agent's Docker environment is permitted to boot, **Trivy** externally scans the entire container image for hijacked OS dependencies or poisoned Python packages. Once booted, **LLM Guard** validates the integrity of the downloaded local datasets and models, preventing the execution of malicious tensor payloads.

### 2. Input Security
**Status:** ✅ Covered
**Component:** **ResonantOS (Shield Layer)**
**How it works:** When user inputs or external retrieved documents (RAG) are fed into the system, ResonantOS scans them using deterministic YARA rules to detect prompt injections and data poisoning attempts before the text reaches the model.

### 3. Cognitive Alignment
**Status:** ✅ Covered
**Component:** **ResonantOS (Logician Engine)**
**How it works:** The agent's reasoning is governed by rigid Datalog routing policies. Business constraints and truthfulness checks are computed deterministically (e.g., ensuring a strictly structured output) rather than replying on the LLM's inherently probabilistic ability to follow instructions.

### 4. Authorization
**Status:** ✅ Covered (Defense-in-Depth)
**Component:** **ResonantOS (Logic) + IronCurtain (Credentials)**
**How it works:** 
* *Compute:* ResonantOS uses its internal logic layers to ensure a tool query is logically valid against the agent's permission scope.
* *Secrets:* If logically valid, the request is passed. **IronCurtain** intercepts the request across a local Unix socket, takes the *fake* API key the agent was holding, swaps it for the real authenticated API token dynamically, and forwards it to the service. Real secrets are never exposed in the agent's environment.

### 5. Infrastructure Security
**Status:** ✅ Covered
**Component:** **IronCurtain (Docker Mode) + Docker (Kata Containers Runtime)**
**How it works:** The ResonantOS agent runs inside a locked-down Docker container launched via IronCurtain with `--network=none`. To mitigate the risk of host-kernel exploitation, Docker is configured to use the **Kata Containers** runtime, which boots a lightweight, hardware-isolated MicroVM for the agent. It physically cannot dial out to the wider internet or local network directly, and the only exit path is the local Unix socket securely mounted to the trusted IronCurtain proxy.

### 6. Observability
**Status:** ⚠️ Native Logs Only
**Component:** **ResonantOS (Mission Control & Guardian)**
**How it works:** Instead of standard OpenTelemetry LLM traces, ResonantOS relies on internal governance. The Guardian emits structured JSONL incident logs when policies are violated, and the Archivist manages the agent's memory. These are viewed through the proprietary Mission Control dashboard, which focuses on agent state rather than deep metric tracing.

### 7. Human-in-the-Loop (HITL)
**Status:** ✅ Covered
**Component:** **IronCurtain (Escalate Action)**
**How it works:** While ResonantOS has native blocking gates, IronCurtain's proxy cleanly handles HITL completely outside the agent runtime. If the agent requests an action deemed "sensitive" by IronCurtain's proxy configuration (such as writing to a local config file), IronCurtain automatically holds the transaction and flags it to the human operator for explicit approval or denial before firing the real API key.
