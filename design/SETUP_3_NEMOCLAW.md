# Architecture Setup 3: The NemoClaw Runtime

This setup is anchored around **NemoClaw**, NVIDIA's enterprise-hardened runtime designed exactly to secure local **OpenClaw** agents following the "ClawJacked" vulnerability. 

Rather than relying on an external gateway proxy (Setup 1) or an MCP gateway architecture (Setup 2), NemoClaw physically wraps the agent and embeds a default-deny policy engine directly into its execution runtime. Like all setups, it conforms to your local Docker and zero-cloud constraints.

---

## 🏗️ The Tech Stack

1. **NemoClaw (+ OpenClaw):** The core agent runtime and security wrapper. Natively handles syscall-level action interception, sandbox isolation (OpenShell), and Human-in-the-Loop.
2. **NeMo Guardrails:** NVIDIA's dialog and alignment engine. Because they exist in the same ecosystem, NeMo natively provides Colang-based semantic output enforcement to the agent.
3. **LLM Guard:** Defends against supply chain poisoning and runtime prompt injection prior to execution.
4. **Arize Phoenix:** The unified local OpenTelemetry dashboard (locked-in global decision).

---

## 🛡️ The 7-Layer Security Coverage

### 1. Supply Chain Security
**Status:** ✅ Covered
**Component:** **LLM Guard + NemoClaw Blueprints**
**How it works:** NemoClaw uses "Blueprints" to rigidly define an agent's versioned capabilities, strictly limiting what dependencies are even allowed to be loaded. For scanning ML artifacts and foundational models before the agent boots, we rely on **LLM Guard** and local Trivy scans for Docker.

### 2. Input Security
**Status:** ✅ Covered
**Component:** **LLM Guard**
**How it works:** NemoClaw assumes the model will be attacked. We use **LLM Guard** as a pre-flight scanner on incoming user prompts to filter malicious prompt injections or jailbreak payloads. As per your global decision, PII redaction and DLP filters are explicitly **disabled** so the local LLM can freely ingest your personal context.

### 3. Cognitive Alignment
**Status:** ✅ Covered
**Component:** **NeMo Guardrails**
**How it works:** Built by the same ecosystem, NeMo Guardrails injects deterministic "Colang" routing into the OpenClaw agent. This effectively overrides the model's probabilistic drift, forcing the agent's logical output to strictly adhere to formatting rules, topical relevance, and grounded truthfulness before NemoClaw executes the next sandbox step.

### 4. Authorization
**Status:** ✅ Covered
**Component:** **NemoClaw (Policy Engine)**
**How it works:** This is NemoClaw's superpower. It embeds a massive default-deny policy engine natively into the OpenClaw agent runtime. Every single syscall, tool invocation, and network request the agent attempts is intercepted and validated against a declarative Role-Based Access Control (RBAC) policy *before* the host OS even sees it.

### 5. Infrastructure Security
**Status:** ✅ Covered
**Component:** **NemoClaw (OpenShell) inside Docker (Kata Containers Runtime)**
**How it works:** The OpenClaw execution doesn't run natively; it executes code inside NemoClaw's **OpenShell** wrapper. To fully mitigate the risk of host-kernel privilege escalation, we deploy this environment inside Docker explicitly enforcing the **Kata Containers** runtime. This stacks OpenShell's internal process isolation (Landlock/seccomp) on top of a true, hardware-isolated MicroVM boundary, ensuring an agent executing backdoored code cannot break out.

### 6. Observability
**Status:** ⚠️ Split Observability (Audit Logs vs. LLM Traces)
**Component:** **Langfuse + NemoClaw Audit Logs**
**How it works:** NemoClaw emits comprehensive, unalterable enterprise audit logs for every security policy decision it intercepts, but these are raw system actions, not conversational LLM traces. Because you cannot pipe raw system logs into an LLM observability platform, you must run **Langfuse** alongside NemoClaw. Langfuse natively instruments the underlying OpenClaw agent to capture the LLM logic (prompts, tool routing), creating a "split brain" observability setup where you must correlate NemoClaw's security perimeter logs with Langfuse's internal agent traces.

### 7. Human-in-the-Loop (HITL)
**Status:** ✅ Covered
**Component:** **NemoClaw (HITL UI)**
**How it works:** NemoClaw provides a native graphical interface for human escalation. When its internal Policy Engine detects an action you've tagged as restricted (like deleting a core file or making an unauthorized API call), it physically pauses the OpenShell runtime state, routes an auth request to the HITL UI, and waits for your manual override before allowing the agent to proceed.
