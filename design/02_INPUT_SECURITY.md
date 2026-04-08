# Layer 2 — Input Security

> **Filtering what the agent sees: prompt injection, RAG poisoning, and PII leaks.**

---

## The Threat

Input security is the front door to your AI agent. Every user prompt, every document ingested via RAG, every API response parsed by the agent's tools — all of these are potential attack vectors. Unlike traditional web applications where input validation checks for SQL injection or XSS, AI agents must contend with a fundamentally different class of attack: *instructions disguised as data.*

The core problem is that LLMs cannot reliably distinguish between instructions from the developer (system prompt) and instructions embedded in user input or external data. This creates an attack surface where adversaries inject malicious instructions into any data the agent processes.

### Key Attack Vectors

| Vector | Description |
|---|---|
| **Direct Prompt Injection** | Malicious instructions placed directly in the user's prompt to override system instructions. |
| **Indirect Prompt Injection** | Adversarial instructions hidden in external data sources (documents, websites, emails) that the agent retrieves and processes. |
| **RAG Poisoning** | Contaminating retrieval-augmented generation data stores with instructions that alter the agent's behavior when retrieved. |
| **PII Leakage (Input)** | Users inadvertently including sensitive personal information in prompts that get sent to third-party model providers. |
| **Jailbreaking** | Sophisticated multi-turn techniques designed to systematically erode the model's safety constraints. |
| **System Prompt Extraction** | Techniques that trick the agent into revealing its system prompt, exposing business logic and safety boundaries. |

---

## Framework Analysis

### 1. Lakera Guard
🔗 [lakera.ai](https://lakera.ai)

| Attribute | Detail |
|---|---|
| **Type** | Real-time AI security API (now part of Check Point) |
| **Input Security Coverage** | ⭐⭐⭐⭐⭐ Best-in-class for prompt injection |
| **Approach** | ML-powered detection with continuous threat intelligence |
| **💰 Hobbyist Cost** | **FREE** — Community plan: 10,000 API requests/month, 8K tokens/prompt |

**How it addresses this layer:**

Lakera Guard is purpose-built for input security and is widely considered the gold standard for prompt injection detection. Acquired by Check Point in September 2025, it now benefits from enterprise-grade infrastructure while maintaining its specialized focus.

Key capabilities:
- **Prompt Injection Detection:** Both direct and indirect injection detection, with models trained on data from **Gandalf** — Lakera's security game that has generated millions of adversarial prompts from 100,000+ new samples daily.
- **Jailbreak Prevention:** Identifies and blocks multi-turn jailbreak sequences and constraint-erosion techniques.
- **PII Detection & Redaction:** Monitors for personally identifiable information, secrets, and custom data patterns.
- **Content Moderation:** Filters toxic, hateful, violent, or inappropriate content and checks for malicious URLs.
- **Sub-50ms Latency:** Optimized for real-time, production-grade deployments.
- **Model Agnostic:** Works as an API-based security layer compatible with any LLM.

**Strengths:** Industry-leading prompt injection detection. Continuously updated threat intelligence. Enterprise backing via Check Point. Easy integration (single API endpoint, OpenAI-compatible format).
**Gaps:** Managed SaaS — requires sending data to Lakera's servers. Not open-source. Check Point acquisition may shift focus toward enterprise over independent AI security.

---

### 2. Protect AI (LLM Guard)
🔗 [protectai.com](https://protectai.com)

| Attribute | Detail |
|---|---|
| **Type** | Open-source input/output sanitization toolkit |
| **Input Security Coverage** | ⭐⭐⭐⭐ Comprehensive, self-hostable |
| **Approach** | Scanner-based pre/post-processing pipeline |
| **💰 Hobbyist Cost** | **FREE** — open-source, self-hosted, no limits |

**How it addresses this layer:**

LLM Guard is the most comprehensive open-source option for input security. It implements a scanner architecture that inspects data at two critical points:

**Input Scanners (Pre-processing):**
- **Prompt Injection Detection:** Identifies and blocks malicious instructions designed to manipulate the model.
- **PII Filtering & Anonymization:** Scans for and redacts sensitive PII before it reaches the LLM.
- **Content Moderation:** Detects and blocks harmful content, forbidden topics, and adversarial patterns.

**Output Scanners (Post-processing):**
- **Compliance Enforcement:** Validates outputs against organizational policies.
- **Data Leakage Prevention:** Screens responses for sensitive data that shouldn't be exposed.
- **Structural Validation:** Ensures outputs conform to expected formats (e.g., JSON schemas).

LLM Guard is model-agnostic and can be integrated into frameworks like LangChain to provide a consistent security layer.

**Strengths:** Open-source. Self-hostable (data never leaves your infrastructure). Comprehensive scanner library. Model-agnostic.
**Gaps:** Requires self-hosting and maintenance. Community-driven threat intelligence may lag behind Lakera's dedicated research team.

---

### 3. Microsoft Presidio
🔗 [microsoft.github.io/presidio](https://microsoft.github.io/presidio)

| Attribute | Detail |
|---|---|
| **Type** | Open-source PII detection and anonymization |
| **Input Security Coverage** | ⭐⭐⭐ Specialized (PII only) |
| **Approach** | NLP + regex + rule-based recognizers |
| **💰 Hobbyist Cost** | **FREE** — open-source (MIT license), self-hosted, no limits |

**How it addresses this layer:**

Microsoft Presidio is a specialized tool focused exclusively on PII detection and anonymization. While it doesn't address prompt injection or jailbreaking, it is the most mature and configurable option for the PII dimension of input security.

**Core Components:**
- **Presidio Analyzer:** Identifies PII entities (names, emails, phone numbers, credit cards, SSNs, etc.) using customizable recognizers built on NLP, regex, and rule-based logic.
- **Presidio Anonymizer:** De-identifies detected entities using multiple operators:
  - **Redact** — completely removes the PII
  - **Mask** — replaces with characters (e.g., `****`)
  - **Replace** — substitutes with a placeholder (e.g., `[PHONE_NUMBER]`)
  - **Hash/Encrypt** — pseudonymizes or encrypts the data
- **Presidio Image Redactor:** Detects and redacts PII from images (useful for multimodal agents).

Presidio is actively maintained (last updated March 2026) and is designed to be customized with organization-specific recognizers.

**Strengths:** Best-in-class PII handling. Highly customizable recognizers. Supports text, structured data, and images. Open-source (MIT license). Active development.
**Gaps:** Does *not* detect prompt injection, jailbreaks, or adversarial inputs. Must be combined with other tools for complete input security.

---

### 4. ResonantOS (Shield Layer)
🔗 [resonantos.com](https://resonantos.com)

| Attribute | Detail |
|---|---|
| **Type** | Deterministic input scanning within a cognitive architecture |
| **Input Security Coverage** | ⭐⭐⭐ Deterministic but scope-limited |
| **Approach** | YARA rules + deterministic pattern matching |
| **💰 Hobbyist Cost** | **FREE** — fully open-source |

**How it addresses this layer:**

ResonantOS's **Shield** layer provides input security using a fundamentally different philosophy than ML-based detectors. Instead of probabilistic classification, Shield uses **deterministic methods like YARA rules** to scan inputs for known prompt injection patterns and jailbreak attempts.

This approach offers guarantees that ML-based detectors cannot:
- **Zero false negatives for known patterns** — if a pattern matches a YARA rule, it *will* be caught.
- **No model drift** — the detection logic doesn't change unless a human updates the rules.
- **Sub-100ms latency** — deterministic matching is extremely fast.

However, the deterministic approach has an inherent limitation: it can only detect *known* attack patterns. Novel prompt injection techniques that don't match existing rules will pass through undetected.

**Strengths:** Deterministic — no probabilistic uncertainty. Extremely fast. Part of a holistic cognitive architecture. Open-source.
**Gaps:** Cannot detect novel/zero-day prompt injection techniques. Requires manual rule updates. No PII detection capability. Limited to pattern-based detection.

---

### 5. Amazon Bedrock Guardrails
🔗 [aws.amazon.com/bedrock/guardrails](https://aws.amazon.com/bedrock/guardrails)

| Attribute | Detail |
|---|---|
| **Type** | Managed cloud-native guardrails service |
| **Input Security Coverage** | ⭐⭐⭐⭐ Comprehensive, managed |
| **Approach** | Configurable policy filters (AWS-managed) |
| **💰 Hobbyist Cost** | **~$0.15 per 1,000 text units** — pay-per-use, no subscription. Very cheap at low volume (~pennies/month for hobby use). |

**How it addresses this layer:**

Amazon Bedrock Guardrails provides a comprehensive, managed input security layer that is deeply integrated with the AWS ecosystem. It inspects both inputs and outputs with six primary policy types:

- **Content Filters:** Detects and blocks harmful material (hate speech, violence, sexual content) with configurable sensitivity levels. Now supports both **text and image modalities**.
- **Prompt Attack Prevention:** Specifically detects jailbreak attempts, prompt injections, and adversarial inputs.
- **Sensitive Information Filters:** Automatically detects and redacts PII (names, emails, phone numbers, credit cards) using predefined categories or custom regex patterns.
- **Denied Topics:** Blocks specific subjects the model should refuse to discuss.
- **Word Filters:** Blocks exact matches of profanity, competitor names, or compliance-sensitive terms.
- **Contextual Grounding:** Evaluates whether responses are grounded in source material, reducing hallucinations.

The `ApplyGuardrail` API allows these guardrails to be used *independently* of a Bedrock model invocation — meaning they can be applied to third-party or self-hosted models as well.

**Strengths:** Fully managed (no infrastructure to maintain). Multimodal support. Comprehensive policy types. Independent API for non-Bedrock models. Version management and testing playground.
**Gaps:** AWS vendor lock-in. Managed service — data is processed by AWS. Limited customization compared to self-hosted solutions. Cost scales with usage.

---

## Comparative Matrix

| Capability | Lakera Guard | LLM Guard | Presidio | ResonantOS Shield | Bedrock Guardrails |
|---|:---:|:---:|:---:|:---:|:---:|
| Direct prompt injection | ✅ Best | ✅ | ❌ | ✅ Known patterns | ✅ |
| Indirect prompt injection | ✅ Best | ✅ | ❌ | ⚠️ Limited | ✅ |
| Jailbreak detection | ✅ | ✅ | ❌ | ✅ | ✅ |
| PII detection/redaction | ✅ | ✅ | ✅ Best | ❌ | ✅ |
| Image moderation | ❌ | ❌ | ✅ | ❌ | ✅ |
| Content moderation | ✅ | ✅ | ❌ | ❌ | ✅ |
| Self-hostable | ❌ | ✅ | ✅ | ✅ | ❌ |
| Open-source | ❌ | ✅ | ✅ | ✅ | ❌ |
| Latency | <50ms | Variable | Variable | <100ms | Variable |
| Novel attack detection | ✅ ML-based | ✅ ML-based | N/A | ❌ Rule-based | ✅ ML-based |
| **💰 Hobbyist cost** | **Free (10K/mo)** | **Free** | **Free** | **Free** | **~pennies** |
| **🍎 Mac ease** | ✅ SaaS API | ✅ `pip install` | ✅ `pip install` | ⚠️ Docker/Linux deps | ✅ AWS API |

---

## Recommendations

> [!IMPORTANT]
> **Prompt injection is the #1 AI security risk in 2026.** No single tool eliminates it. A robust input security posture should combine:
> - **Lakera Guard** or **Bedrock Guardrails** for ML-based prompt injection detection (catches novel attacks)
> - **ResonantOS Shield** for deterministic pattern matching (catches known attacks with zero false negatives)
> - **Microsoft Presidio** or **LLM Guard** for PII redaction before data reaches the LLM
> - **LLM Guard** for self-hosted, open-source comprehensive scanning

> [!WARNING]
> **RAG Poisoning** is an indirect prompt injection vector that is particularly difficult to detect because the malicious instructions are embedded in trusted data sources. Ensure your RAG pipeline includes sanitization of ingested documents — this is a gap in most frameworks and may require custom tooling.

---

## 💰 Hobbyist Cost Summary

| Framework | Hobbyist Cost | Notes |
|---|---|---|
| **Lakera Guard** | ✅ **$0** | Free Community plan: 10,000 requests/month. Plenty for personal projects. |
| **Protect AI (LLM Guard)** | ✅ **$0** | Open-source. Self-hosted. Unlimited usage. |
| **Microsoft Presidio** | ✅ **$0** | Open-source (MIT). Self-hosted. Unlimited usage. |
| **ResonantOS (Shield)** | ✅ **$0** | Open-source. Self-hosted. |
| **Amazon Bedrock Guardrails** | ⚠️ **~pennies/mo** | $0.15 per 1,000 text units. At hobby scale, likely <$1/month. Requires AWS account. |

> [!TIP]
> **Best free combo for this layer:** LLM Guard (self-hosted, comprehensive scanning) + Lakera Guard (free tier for ML-based prompt injection detection) + Microsoft Presidio (PII redaction). Total cost: **$0**.
