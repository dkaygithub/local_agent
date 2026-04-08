# Layer 1 — Supply Chain Security

> **Securing model weights, dependencies, and system prompts.**

---

## The Threat

The AI supply chain introduces a new class of risk that traditional software security was never designed to handle. Unlike deterministic code, AI systems depend on opaque model weights, massive training datasets, third-party plugins, and prompt templates that define the agent's personality and boundaries.

An attacker who compromises any link in this chain — poisoning a fine-tuning dataset, tampering with model weights in transit, injecting malicious logic into a shared agent "skill," or extracting a system prompt to reverse-engineer the agent's constraints — can undermine the entire stack *before the agent even processes its first user input*.

### Key Attack Vectors

| Vector | Description |
|---|---|
| **Model Weight Tampering** | Altering serialized model files to embed backdoors, trojans, or biased behavior that activates under specific conditions. |
| **Dependency Poisoning** | Exploiting vulnerabilities in AI SDKs, MCP servers, or third-party agent skills that are downloaded and trusted implicitly. |
| **System Prompt Extraction** | Adversarial techniques that trick the agent into revealing its system prompt, exposing business logic, safety constraints, and persona details. |
| **Training Data Poisoning** | Corrupting the data used to train or fine-tune models, embedding subtle biases or malicious behaviors. |
| **Shadow AI** | Unauthorized or unmanaged AI deployments that bypass enterprise security controls and governance policies. |

---

## Framework Analysis

### 1. Protect AI (LLM Guard)
🔗 [protectai.com](https://protectai.com)

| Attribute | Detail |
|---|---|
| **Type** | Open-source security toolkit + enterprise suite |
| **Supply Chain Coverage** | ⭐⭐⭐⭐⭐ Comprehensive |
| **Approach** | Model-agnostic scanning and sanitization |
| **💰 Hobbyist Cost** | **FREE** — open-source core (self-hosted) |

**How it addresses this layer:**

Protect AI provides the most purpose-built supply chain security tooling in this category. Its LLM Guard component offers input/output scanners that can detect attempts to extract system prompts (a supply chain asset). At the enterprise level, Protect AI offers vulnerability scanning for the AI supply chain itself — auditing model files, serialization formats (like Pickle), and third-party components for known vulnerabilities.

LLM Guard's scanner architecture allows organizations to:
- Detect and block system prompt extraction attempts
- Scan AI artifacts for known vulnerability patterns
- Enforce content policies that prevent leakage of proprietary prompt logic

**Strengths:** Purpose-built for the AI supply chain. Model-agnostic. Open-source core with enterprise extensions.
**Gaps:** Focused primarily on the model-interaction layer; does not directly address infrastructure-level dependency management (e.g., OS packages, container images).

---

### 2. Snyk for AI
🔗 [snyk.io](https://snyk.io)

| Attribute | Detail |
|---|---|
| **Type** | Enterprise AI Security Fabric (SaaS) |
| **Supply Chain Coverage** | ⭐⭐⭐⭐⭐ Comprehensive + Proactive |
| **Approach** | Hybrid Symbolic + Generative AI scanning |
| **💰 Hobbyist Cost** | **FREE** — free tier includes SCA, SAST, Container, IaC scanning (test limits apply) |

**How it addresses this layer:**

Snyk has evolved from traditional code/dependency scanning into a full "AI Security Fabric" in 2026. Its **DeepCode AI Engine** combines symbolic analysis (for mathematical precision and taint analysis) with generative AI (for context-aware fix generation). For supply chain security specifically:

- **Transitive AI Reachability:** Goes beyond listing vulnerable dependencies — determines whether a vulnerable function deep in the dependency tree is actually *reachable* and exploitable by your code.
- **Snyk Evo AI-SPM:** Generates a live "AI Bill of Materials" (AI-BOM) that maps the full attack surface of AI agent environments.
- **Agent Scan:** Specifically secures the supply chain of tools that agents rely on, ensuring MCP servers and agent skills are trusted and governed.
- **Snyk Studio:** Integrates into AI coding assistants (Claude Code, Cursor, Copilot) to provide real-time security guardrails as code is generated.

**Strengths:** Industry-leading dependency scanning. Understands transitive risk. Automated PR-based remediation. Deep IDE integration.
**Gaps:** Primarily an enterprise SaaS product — cost may be prohibitive for small teams. Does not directly scan model weights.

---

### 3. Wiz (AI-SPM)
🔗 [wiz.io](https://wiz.io)

| Attribute | Detail |
|---|---|
| **Type** | Cloud-native AI Security Posture Management (CNAPP) |
| **Supply Chain Coverage** | ⭐⭐⭐⭐ Strong (cloud-centric) |
| **Approach** | Agentless discovery + contextual risk graph |
| **💰 Hobbyist Cost** | **💸 Enterprise only** — no free tier, contact sales. Not viable for hobbyists. |

**How it addresses this layer:**

Wiz approaches supply chain security from the cloud infrastructure perspective. Its **AI-SPM** module provides:

- **Shadow AI Discovery:** Automatically discovers unauthorized AI tools, unmanaged AI services, and rogue models deployed by employees across the organization's cloud environments.
- **AI-BOM (AI Bill of Materials):** Provides visibility into managed AI services (AWS Bedrock, Vertex AI) and self-hosted models, identifying vulnerabilities in AI SDKs and dependencies.
- **Security Graph:** Connects code, cloud, and AI assets to show how different risks (overprivileged service account, misconfigured training bucket, exposed inference endpoint) interact to create exploitable attack paths.
- **Runtime Monitoring:** Tracks model activity, workload execution, and cloud-layer API calls in real time.

As of March 2026, Wiz introduced **AI-APP** (AI Application Protection Platform), which extends CNAPP to secure the *entire* AI lifecycle — models, agents, data, and infrastructure.

**Strengths:** Unmatched cloud visibility. Contextual risk prioritization. Discovers shadow AI. No agent installation required.
**Gaps:** Cloud-centric — limited value for on-premise or edge deployments. Does not provide input/output scanning at the prompt level.

---

### 4. ResonantOS (Shield + Logician)
🔗 [resonantos.com](https://resonantos.com)

| Attribute | Detail |
|---|---|
| **Type** | Open-source cognitive architecture |
| **Supply Chain Coverage** | ⭐⭐⭐ Moderate (focused on runtime enforcement) |
| **Approach** | Deterministic policy enforcement via Datalog |
| **💰 Hobbyist Cost** | **FREE** — fully open-source |

**How it addresses this layer:**

ResonantOS addresses supply chain security primarily through its **Shield** and **Logician** layers:

- **Shield:** Scans incoming inputs for prompt injection and jailbreak attempts using deterministic methods like YARA rules. This protects the system prompt (a supply chain asset) from extraction.
- **Logician:** A Datalog-based policy engine (built on Mangle) that enforces "policy as code" — ensuring that no agent action can violate predefined security constraints, regardless of what the model "wants" to do.
- **12 Blocking Layers:** A comprehensive set of gates (Direct Coding Gates, Delegation Gates, Configuration Change Gates) that serve as non-negotiable boundaries the AI's reasoning engine cannot override.

**Strengths:** Deterministic enforcement that cannot be bypassed by probabilistic drift. System prompt protection via Shield. Open-source.
**Gaps:** Does not scan external dependencies, model weights, or training data. Focused on runtime protection rather than pre-deployment supply chain auditing.

---

### 5. IronCurtain
🔗 [ironcurtain.dev](https://ironcurtain.dev) · [GitHub](https://github.com/nicholasgasior/ironcurtain)

| Attribute | Detail |
|---|---|
| **Type** | Open-source deterministic security proxy |
| **Supply Chain Coverage** | ⭐⭐⭐ Moderate (focused on credential and prompt isolation) |
| **Approach** | Trusted proxy with credential separation |
| **💰 Hobbyist Cost** | **FREE** — fully open-source |

**How it addresses this layer:**

IronCurtain's contribution to supply chain security is primarily through **credential separation** and **system prompt isolation**:

- **Credential Separation:** In Docker Mode, the agent receives a "fake" API key that passes format validation but has no actual access. The trusted proxy intercepts outbound requests, swaps the fake key for the real one, and forwards it upstream. This prevents credential theft even if the agent's execution environment is compromised.
- **Plain-English Policies:** The "constitution" written by the user defines what the agent is allowed to do. This policy is compiled into deterministic rules and enforced at the proxy layer — outside the LLM's probabilistic reasoning.
- **Network Isolation:** In Docker Mode, the agent container runs with `--network=none`, communicating only via Unix sockets to the trusted proxy. This prevents the agent from exfiltrating data or reaching unauthorized endpoints.

**Strengths:** Eliminates credential exposure to the agent entirely. Deterministic policy enforcement. Early-stage but architecturally sound.
**Gaps:** Does not scan dependencies, model weights, or training data. Research prototype — not yet production-hardened for enterprise use.

---

## Comparative Matrix

| Capability | Protect AI | Snyk | Wiz | ResonantOS | IronCurtain |
|---|:---:|:---:|:---:|:---:|:---:|
| Model weight scanning | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dependency vulnerability scanning | ⚠️ Partial | ✅ | ✅ | ❌ | ❌ |
| System prompt protection | ✅ | ❌ | ❌ | ✅ | ✅ |
| AI Bill of Materials | ⚠️ Partial | ✅ | ✅ | ❌ | ❌ |
| Shadow AI discovery | ❌ | ✅ | ✅ | ❌ | ❌ |
| Credential isolation | ❌ | ❌ | ❌ | ❌ | ✅ |
| Open-source | ✅ Core | ❌ | ❌ | ✅ | ✅ |
| **💰 Hobbyist cost** | **Free** | **Free** | **Enterprise** | **Free** | **Free** |
| **🍎 Mac ease** | ✅ `pip install` | ✅ SaaS CLI | ✅ Cloud SaaS | ⚠️ Docker/Linux deps | ⚠️ Docker required |

---

## Recommendations

> [!TIP]
> **Defense-in-depth is essential at this layer.** No single tool covers the full AI supply chain. A mature posture combines:
> - **Snyk or Wiz** for dependency and cloud-level supply chain visibility
> - **Protect AI** for model-specific artifact scanning
> - **ResonantOS Shield** or **IronCurtain** for runtime system prompt protection
> - **IronCurtain** for credential isolation from the agent

---

## 💰 Hobbyist Cost Summary

| Framework | Hobbyist Cost | Notes |
|---|---|---|
| **Protect AI (LLM Guard)** | ✅ **$0** | Open-source, self-hosted. Run locally. |
| **Snyk** | ✅ **$0** | Free tier: 400 SCA + 100 SAST + 300 IaC + 100 Container tests/month. Plenty for hobby projects. |
| **Wiz** | ❌ **Enterprise only** | No free tier. Contact sales. Not viable for hobbyists. |
| **ResonantOS** | ✅ **$0** | Fully open-source. Self-hosted. |
| **IronCurtain** | ✅ **$0** | Fully open-source. Runs locally with Docker. |

> [!TIP]
> **Best free combo for this layer:** Snyk (free tier for dependency scanning) + LLM Guard (self-hosted for prompt protection) + IronCurtain (credential isolation). Total cost: **$0**.
