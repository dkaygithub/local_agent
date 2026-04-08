# Layer 5 — Infrastructure

> **Containing the blast radius of code execution.**

---

## The Threat

When an AI agent can execute code, the security problem transforms from "can the agent say something harmful?" to "can the agent *do* something harmful?" Code execution is the highest-privilege capability an agent can possess — it means the agent can interact with the file system, network, operating system APIs, and potentially the entire host machine.

The "ClawJacked" vulnerability in OpenClaw (March 2026) demonstrated this risk vividly: a malicious website could hijack a locally-running AI agent and gain full control of the user's system. The root cause was a lack of proper isolation — the agent had direct access to the host environment.

Infrastructure security is about **containment**. If the agent is compromised, the blast radius must be limited to a disposable, isolated environment that contains no sensitive data and has no access to production systems.

### Key Risks

| Risk | Description |
|---|---|
| **Host Escape** | Agent-generated code breaks out of its execution environment and accesses the host system. |
| **Credential Theft** | Code execution enables reading environment variables, filesystem credentials, or in-memory secrets. |
| **Lateral Movement** | From the execution environment, the agent pivots to other services on the network. |
| **Resource Exhaustion** | Unbounded code execution consumes CPU, memory, or disk, impacting other workloads. |
| **Persistent Compromise** | An attacker establishes persistence in the execution environment that survives between sessions. |
| **GPU Blind Spots** | Traditional EDR tools lack visibility into GPU-accelerated workloads, creating unmonitored attack surfaces. |

---

## Framework Analysis

### 1. E2B (Secure Micro-VMs)
🔗 [e2b.dev](https://e2b.dev)

| Attribute | Detail |
|---|---|
| **Type** | Purpose-built AI agent code execution platform |
| **Infrastructure Security** | ⭐⭐⭐⭐⭐ Strongest isolation guarantee |
| **Approach** | Firecracker microVMs with hardware-level isolation |
| **💰 Hobbyist Cost** | **FREE to start** — $100 one-time credit, then usage-based (per-second billing). Hobby use likely stays within free credits for a while. |

**How it addresses this layer:**

E2B provides the gold standard for AI agent code execution isolation. Built on **Firecracker microVMs** — the same technology powering AWS Lambda — each sandbox runs in its own dedicated virtual machine with a private Linux kernel.

**Key Security Properties:**
- **Hardware-Level Isolation:** Unlike containers (which share the host kernel), each E2B sandbox has its own kernel. This creates a hard boundary that prevents cross-tenant attacks.
- **Ephemeral by Default:** Sandboxes are created for a task and destroyed afterward. No state persists between sessions, eliminating persistence attacks.
- **Network Segmentation:** Each sandbox has its own network namespace, preventing lateral movement.
- **Sub-200ms Cold Starts:** Designed for the rapid, iterative nature of AI agents. No meaningful cold-start penalty.
- **SDK-Driven:** Python and TypeScript SDKs allow programmatic creation, control, and destruction of sandboxes.
- **LLM Agnostic:** Works with any model provider (OpenAI, Anthropic, Mistral, etc.).
- **MCP Integration:** Through partnerships with Docker, E2B sandboxes can integrate with MCP for secure tool access.

**Adoption:** E2B has become the standard execution substrate for platforms like Cursor, Perplexity, and Vercel.

**Strengths:** Strongest isolation (hardware-level via Firecracker). Sub-200ms startup. Purpose-built for AI. Ephemeral by default. Broad ecosystem adoption.
**Gaps:** Managed service — requires trust in E2B's infrastructure. Less control than self-hosted solutions. Cost scales with usage and sandbox duration.

---

### 2. IronCurtain (Docker Mode)
🔗 [ironcurtain.dev](https://ironcurtain.dev)

| Attribute | Detail |
|---|---|
| **Type** | Open-source sandboxed execution environment |
| **Infrastructure Security** | ⭐⭐⭐⭐ Strong containerized isolation |
| **Approach** | Docker containers with `--network=none` + trusted proxy |
| **💰 Hobbyist Cost** | **FREE** — fully open-source. Requires Docker (also free). |

**How it addresses this layer:**

IronCurtain offers two execution modes, with Docker Mode being the infrastructure security solution:

**Docker Mode Architecture:**
```
┌─────────────────────────────────────────────────┐
│  Docker Container (--network=none)               │
│  ┌───────────────┐                               │
│  │  AI Agent      │──Unix Socket──┐              │
│  │  (e.g., Claude │               │              │
│  │   Code)        │               ▼              │
│  └───────────────┘     ┌─────────────────┐       │
│                        │ Trusted MCP     │       │
│                        │ Proxy           │       │
│                        └────────┬────────┘       │
│                                 │                │
│      No filesystem access       │ Unix Socket    │
│      No network access          │                │
│      No env var access          ▼                │
│                        ┌─────────────────┐       │
│                        │ TLS-Terminating │       │
│                        │ Proxy           │──────►│ Authorized APIs
│                        └─────────────────┘       │
└─────────────────────────────────────────────────┘
```

- **Network Isolation:** `--network=none` means the container has zero direct network access. All communication is via Unix sockets.
- **Credential Separation:** The agent receives fake API keys. The proxy swaps them for real credentials before forwarding upstream.
- **Filesystem Isolation:** The agent cannot access the host filesystem.
- **Environment Isolation:** No environment variables are exposed to the agent.

**Code Mode Alternative:**
For lighter-weight execution, IronCurtain's Code Mode runs LLM-generated TypeScript in a **V8 isolate** with no filesystem, network, or environment variable access.

**Strengths:** Open-source. Credential separation is unique. Zero direct network access. V8 isolate option for lightweight execution. Unix socket-only communication.
**Gaps:** Container-level isolation (not hardware-level like E2B). Research prototype. Requires Docker infrastructure management. Limited to single-agent scenarios.

---

### 3. Modal
🔗 [modal.com](https://modal.com)

| Attribute | Detail |
|---|---|
| **Type** | Serverless AI execution platform |
| **Infrastructure Security** | ⭐⭐⭐⭐ Strong isolation with GPU support |
| **Approach** | gVisor container runtime + managed sandboxes |
| **💰 Hobbyist Cost** | **$30/mo free credits** — Starter plan includes $30/month in free compute. Per-second billing after that. |

**How it addresses this layer:**

Modal provides a serverless execution environment optimized for AI workloads, including GPU-intensive tasks:

- **gVisor Isolation:** Uses Google's gVisor container runtime, which intercepts system calls to provide a security boundary between workloads. While not hardware-level isolation like Firecracker, gVisor provides stronger isolation than standard containers.
- **Sandbox Primitive:** A dedicated "Sandbox" API for executing untrusted or AI-generated code, manageable through the Modal SDK.
- **GPU Support:** Unlike E2B (which is CPU-focused), Modal natively supports NVIDIA GPUs (H100, H200, B200) for AI workloads that require GPU acceleration.
- **Python-First:** Container images, dependencies, and hardware requirements are defined directly in Python code — no YAML or Kubernetes management.
- **Auto-Scaling:** Designed for "spiky" or bursty AI workloads, scaling to thousands of GPUs within seconds.

**Strengths:** GPU support (H100, H200, B200). Python-first developer experience. Auto-scaling for bursty workloads. gVisor isolation. Serverless — no infrastructure management.
**Gaps:** gVisor isolation is weaker than Firecracker microVMs. Managed service. Less ecosystem integration with AI agent frameworks compared to E2B. Primarily a compute platform (sandboxes are a secondary feature).

---

### 4. Docker (Self-Managed)
🔗 [docker.com](https://docker.com)

| Attribute | Detail |
|---|---|
| **Type** | Industry-standard containerization platform |
| **Infrastructure Security** | ⭐⭐⭐ Baseline, configurable |
| **Approach** | Container isolation with manual security hardening |
| **💰 Hobbyist Cost** | **FREE** — Docker Desktop is free for personal use. Docker Engine is open-source. |

**How it addresses this layer:**

Docker provides the most flexible and widely-understood containerization platform, but requires significant manual configuration to achieve AI-agent-grade security:

**Security Configuration Required:**
- **Non-Privileged Containers:** Run containers with `--cap-drop=ALL` and only add back required capabilities.
- **Read-Only Filesystems:** Use `--read-only` to prevent the agent from writing to the container's filesystem.
- **Network Restrictions:** Use `--network=none` or custom networks with strict firewall rules.
- **Resource Limits:** Set CPU, memory, and disk limits with `--cpus`, `--memory`, and `--storage-opt`.
- **Seccomp Profiles:** Apply custom seccomp profiles to restrict available system calls.
- **No New Privileges:** Use `--security-opt=no-new-privileges` to prevent privilege escalation.

**MCP Integration:** Docker has partnered with E2B to provide MCP-based tool access from sandboxed environments.

**Strengths:** Industry-standard. Maximum flexibility. Extensive ecosystem. No vendor lock-in. Free.
**Gaps:** Containers share the host kernel — weaker isolation than VMs. Requires significant security expertise to configure properly. No built-in agent-specific features. Manual management overhead.

---

### 5. ResonantOS (Guardian)
🔗 [resonantos.com](https://resonantos.com)

| Attribute | Detail |
|---|---|
| **Type** | Self-healing watchdog within a cognitive architecture |
| **Infrastructure Security** | ⭐⭐⭐ Runtime monitoring, not isolation |
| **Approach** | Health monitoring + auto-recovery + incident logging |
| **💰 Hobbyist Cost** | **FREE** — fully open-source |

**How it addresses this layer:**

ResonantOS's **Guardian** layer provides a different type of infrastructure security — not containment, but *resilience*:

- **Health Monitoring:** Continuously monitors agent health and operational status.
- **Auto-Recovery:** If an agent crashes or experiences an incident, the Guardian triggers recovery processes.
- **Incident Logging:** Maintains detailed logs of all incidents for post-mortem analysis.
- **Self-Healing:** Designed to automatically restore normal operation without human intervention.

The Guardian doesn't provide execution isolation — it's not a sandbox. Instead, it ensures that if something goes wrong within the execution environment, the system recovers gracefully and maintains an audit trail.

**Strengths:** Self-healing reduces downtime. Incident logging provides forensic capability. Part of a holistic cognitive architecture. Open-source.
**Gaps:** Does NOT provide execution isolation. Not a substitute for a sandbox. Focused on resilience, not containment. A compromised agent still has access to whatever the Guardian cannot restrict.

---

### 6. NemoClaw (OpenShell Runtime)
🔗 [nemoclaw.bot](https://nemoclaw.bot) · [GitHub](https://github.com/NVIDIA/NemoClaw)

| Attribute | Detail |
|---|---|
| **Type** | Kernel-level sandboxed agent runtime |
| **Infrastructure Security** | ⭐⭐⭐⭐ Strong kernel-level isolation without VMs |
| **Approach** | Landlock LSM + seccomp + network namespaces ("OpenShell") |
| **💰 Hobbyist Cost** | **FREE** — open-source (Apache 2.0). Runs on Mac Mini (16GB). |

**How it addresses this layer:**

NemoClaw's **OpenShell** runtime provides kernel-level sandboxing that sits between Docker-level isolation and hardware-level VMs:

**Isolation Mechanisms:**
- **Landlock LSM:** Linux Security Module that restricts filesystem access at the kernel level. Agents can only access files and directories explicitly declared in their blueprint.
- **seccomp (Secure Computing):** Filters system calls at the kernel level, blocking dangerous syscalls (e.g., `mount`, `reboot`, `ptrace`) that could be used for container escape.
- **Network Namespaces:** Each agent runs in its own network namespace, preventing lateral movement and unauthorized network access.
- **Default-Deny:** The combination creates a "default-deny" sandbox — the agent can *only* do what its security policy explicitly allows.

**Key Differentiator:** Unlike E2B (separate VMs) or IronCurtain (Docker + proxy), NemoClaw's isolation is *built into the agent process itself*. The agent and its sandbox are a single unit. This means lower overhead than spinning up VMs, but the tradeoff is that the sandbox shares the host kernel (like Docker, unlike Firecracker).

**Mac Mini Compatibility:** OpenShell's Linux-specific features (Landlock, seccomp) run natively on Linux. On macOS (your Mac Mini), NemoClaw would run inside a Linux VM (e.g., Docker Desktop's Linux VM or OrbStack) to access these kernel features. The 16GB RAM is sufficient for the orchestration layer + lightweight agent workloads.

**Strengths:** Kernel-level isolation without VM overhead. Default-deny model. Integrated with the agent runtime (no separate proxy needed). Open-source. Lower resource footprint than Firecracker VMs.
**Gaps:** Linux-specific kernel features require a Linux VM on macOS. Shares host kernel (like Docker, weaker than Firecracker). Tightly coupled to OpenClaw/NemoClaw ecosystem. No credential separation (unlike IronCurtain).

---

## Comparative Matrix

| Capability | E2B | IronCurtain | Modal | Docker | ResonantOS Guardian | NemoClaw OpenShell |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Isolation level | Hardware (Firecracker) | Container (Docker) | gVisor | Container (shared kernel) | None (monitoring) | Kernel (Landlock/seccomp) |
| Cold start time | <200ms | Variable | Fast | Fast | N/A | Fast (process-level) |
| GPU support | ❌ | ❌ | ✅ Best | ✅ Manual | N/A | ⚠️ Via NVIDIA NIM |
| Ephemeral by default | ✅ | ⚠️ Configurable | ⚠️ Configurable | ❌ Manual | N/A | ⚠️ Blueprint-scoped |
| Credential separation | ❌ | ✅ Best | ❌ | ❌ | ❌ | ❌ |
| Network isolation | ✅ | ✅ (--network=none) | ✅ | ⚠️ Manual config | ❌ | ✅ (namespaces) |
| Self-healing | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Default-deny sandbox | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| MCP integration | ✅ | ✅ | ❌ | ✅ (via E2B) | ❌ | ⚠️ OpenClaw skills |
| Open-source | ⚠️ Partial | ✅ | ❌ | ✅ | ✅ | ✅ |
| Managed service | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **💰 Hobbyist cost** | **Free credits** | **Free** | **$30/mo credits** | **Free** | **Free** | **Free** |
| **🍎 Mac ease** | ✅ SaaS SDK | ⚠️ Docker required | ✅ SaaS SDK | ✅ Docker Desktop | ✅ `pip install` | ⚠️ Docker (Linux VM) |

---

## Recommendations

> [!IMPORTANT]
> **Assume the agent will be compromised.** The question is not *if* the agent's execution environment will be attacked, but whether the blast radius is contained when it happens.

> [!TIP]
> **Recommended architecture by use case:**
> - **General-purpose AI agents:** E2B (strongest isolation, easiest to integrate)  
> - **GPU-intensive workloads:** Modal (native GPU support + gVisor isolation)
> - **Local development / personal agents:** IronCurtain (credential separation + Docker isolation)
> - **Enterprise self-hosted:** Docker with hardened configuration + ResonantOS Guardian for resilience
> - **Any deployment:** Add ResonantOS Guardian for self-healing and incident logging regardless of the sandbox choice

> [!WARNING]
> **Docker alone is NOT sufficient.** Out-of-the-box Docker containers share the host kernel and provide weaker isolation than VMs. If using Docker, apply full security hardening (non-privileged, read-only FS, no network, seccomp profiles, resource limits).

---

## 💰 Hobbyist Cost Summary

| Framework | Hobbyist Cost | Notes |
|---|---|---|
| **E2B** | ✅ **$0 to start** | $100 one-time free credit. Per-second billing after. Hobby use may last months on free credits. |
| **IronCurtain** | ✅ **$0** | Open-source. Runs locally with Docker. |
| **Modal** | ✅ **$0 to start** | $30/month free compute credits. Very generous for hobby use. |
| **Docker** | ✅ **$0** | Free for personal use. Requires manual security hardening. |
| **ResonantOS (Guardian)** | ✅ **$0** | Open-source. Monitoring only, not isolation. |
| **NemoClaw (OpenShell)** | ✅ **$0** | Open-source (Apache 2.0). Kernel-level sandboxing. Runs on Mac Mini. |

> [!TIP]
> **Best free option:** IronCurtain (Docker Mode) gives you containerized isolation + credential separation + network isolation for **$0**. Add ResonantOS Guardian for self-healing. Use E2B's free credits when you need stronger (hardware-level) isolation.
