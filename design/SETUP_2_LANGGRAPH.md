# Architecture Setup 2: The LangGraph Ecosystem

This setup pivots away from the rigid cognitive engine of ResonantOS and instead anchors entirely on the highly flexible, stateful orchestrator: **LangGraph**.

Because LangGraph focuses primarily on agent flow, memory, and Human-in-the-Loop workflows rather than deep security, this setup relies heavily on "best-in-class" specialized local tools to fill out the remaining security layers. Like Setup 1, this runs locally in Docker with zero cloud dependencies.

---

## 🏗️ The Tech Stack

1. **LangGraph:** The core state machine and orchestrator. Handles memory, graph execution, and multi-day stateful Human-in-the-Loop workflows.
2. **Bifrost:** The local AI gateway (written in Go) acting as the authorization chokepoint. Exposes tools to LangGraph via the Model Context Protocol (MCP).
3. **Guardrails AI:** A highly developer-friendly Python library managing cognitive alignment and output validation natively in code.
4. **LLM Guard:** Defends against supply chain poisoning and runtime prompt injection.
5. **Langfuse:** The unified local trace observability dashboard for LangGraph and OpenTelemetry (OTLP) metrics.

---

## 🛡️ The 7-Layer Security Coverage

### 1. Supply Chain Security
**Status:** ✅ Covered
**Component:** **LLM Guard + Trivy**
**How it works:** LangGraph does not scan dependencies natively. We supplement it with Trivy (scanning the Docker image) and LLM Guard (validating the chosen foundational models before inference) to prevent loading poisoned binaries.

### 2. Input Security
**Status:** ✅ Covered
**Component:** **LLM Guard**
**How it works:** LangGraph accepts freeform text inputs. LLM Guard sits as a pre-flight middleware function within the LangGraph graph, passing user inputs and RAG contexts through local vulnerability scanners. **Crucially**, because this is a local agent designed to process your personal data, PII redaction (like Microsoft Presidio) and DLP modules are strictly *disabled* in LLM Guard's configuration. The middleware is configured to catch only malicious payloads (Prompt Injection, Jailbreaks, Toxicity) so the LLM can freely read your personal context.

### 3. Cognitive Alignment
**Status:** ⚠️ Heavy Boilerplate (Covered but Manual)
**Component:** **Guardrails AI**
**How it works:** Guardrails AI does not provide out-of-the-box alignment. It requires massive developer SDK overhead. You must manually write extensive Pydantic JSON schemas for every distinct agent state, explicitly code custom Python validation functions (like toxicity or hallucination checks), and inject massive retry and error-handling logic directly inside every LangGraph Python node. Only through this heavy boilerplate can it force the model output to be structurally valid and grounded before proceeding.

### 4. Authorization
**Status:** ✅ Covered
**Component:** **Bifrost (Local Gateway)**
**How it works:** LangGraph itself holds no security boundaries. Instead of directly executing tool code inside LangGraph nodes, LangGraph makes Model Context Protocol (MCP) calls to a local **Bifrost** gateway container. Bifrost validates the Virtual Key, checks the specific tool allow-list for that key, and applies budget constraints before firing the tool. 

### 5. Infrastructure Security
**Status:** ✅ Covered
**Component:** **Docker (Kata Containers Runtime)**
**How it works:** LangGraph and Bifrost run within tightly constrained local Docker containers. To secure the LangGraph agent against host-kernel exploits, it specifically employs the **Kata Containers** runtime for hardware-isolated microVM sandboxing. Since Bifrost acts as a unified AI gateway for both tool execution (via MCP) and upstream LLM API routing, the LangGraph container's internet egress is completely blocked via explicit Docker network rules. Its only permitted communication is internal local traffic to the Bifrost and Langfuse containers.

### 6. Observability
**Status:** ✅ Covered (Coalesced Traces)
**Component:** **Langfuse**
**How it works:** Moving away from Arize Phoenix natively solves the "split brain" observability problem. Langfuse acts as the centralized trace collection engine. The LangGraph agent natively streams its internal state transitions, memory events, and LLM reasoning via the Langfuse Python `CallbackHandler`. Simultaneously, the Bifrost Go gateway uses its built-in OpenTelemetry (`otel`) plugin to export physical network routing, budget enforcement, and tool payload validations into Langfuse's `/api/public/otel` endpoint (using `trace_type: genai_extension`). By passing standard W3C `traceparent` HTTP headers from LangGraph's MCP client into Bifrost, the Python "thought process" and the Go "gateway action" are fused into a complete, single distributed trace within the Langfuse dashboard.

### 7. Human-in-the-Loop (HITL)
**Status:** ⭐ Best-in-Class
**Component:** **LangGraph (Native Checkpointing)**
**How it works:** This is where this setup dramatically outshines Setup 1. LangGraph natively serializes the agent's absolute state into a local SQLite database at every node transition. You can pause the agent asynchronously for days, wait for human review via an interrupt, dynamically edit the agent's planned payload, and resume from exactly where it left off.
