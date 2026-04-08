# Architecture Design: NemoClaw Runtime (Setup 3)

**KEY QUESTIONS FOR REVIEW:**
- What are the prioritized failure modes if NemoClaw syscall interception conflicts with host OS permissions?

## System Flow & Deep Technical Specifications

This architecture flips the security model by placing the defense wall *physically inside* the execution wrapper holding the agent, utilizing deep kernel controls combined with NVIDIA's conversational guardrails.

### 1. Pre-Flight (Supply Chain): Blueprints & Trivy
Ensures the runtime environment and dependencies are pristine before instantiation.
- **Execution Mechanism:** Trivy executes a standard pipeline scan on the core `nvcr.io/nvidia/nemo:latest` image. However, NemoClaw introduces a native verification step on boot.
- **Blueprint Verification:** NemoClaw parses a structurally typed YAML Blueprint. Before `exec()` is called on the OpenClaw target script, a compiled Go routine hashes the entire target workspace and python files into a SHA-256 digest tree.
- **Resource Overhead:** Uses ~100MB RAM momentarily to calculate file tree hashes across multiple CPU cores. 
- **Startup Blocking Policy:** If the calculated digest deviates from the registered Agent Signature (implying the python files or downloaded dependencies were secretly modified), the NemoClaw wrapper triggers a `FATAL` error, dumping the execution trace to `stderr` and the Docker container exits with status code `1`.
- **Support Documentation:** [NVIDIA NeMo Container Security Models](https://docs.nvidia.com/deeplearning/frameworks/support-matrix/index.html)

### 2. Ingestion (Input Security): LLM Guard Sandbox Filter
Pre-processes prompt inputs before the semantic routing logic accesses them.
- **Execution Mechanism:** Inputs arrive inside the NemoClaw wrapper. NemoClaw intercepts the I/O payload and maps an asynchronous API request out to the `llm-guard:latest` container natively.
- **Latency & Resource Overhead:** The LLM Guard container statically holds ~1.5-2GB RAM depending on the tensor model size mapping `PromptInjection` blocks. Cross-container latency across the Docker bridge introduces a trivial <50ms delay.
- **Configuration Tolerances:** It explicitly blocks payload hijacking attempts but intentionally ignores data-loss prevention (DLP) or semantic obfuscation modules so the LLM has free text access to personal records.

### 3. Cognitive Alignment: NeMo Guardrails (Colang)
Overriding generative hallucination with deterministic intent routing.
- **Execution Mechanism:** Embedded purely alongside the OpenClaw python application (`import nemoguardrails`).
- **Implementation Strategy:** Developers script cognitive constraints globally in `.co` (Colang) scripts. Instead of a single raw prompt, the Python SDK parses dialogue histories into "Canonical Forms" mapping to logical intents.
- **Latency & Resource Overhead:** NeMo Guardrails requires a local embedding model merely for semantic similarity chunk comparisons to match specific intents (e.g., `MiniLM-L6-v2`), leading to a constant ~3-6GB RAM footprint overhead. Processing introduces an 8-12% latency penalty compared to raw `generate_text()` execution.
- **Output Alignment:** If the raw LLM output diverges probabilastically from the defined `.co` flow constraints (like generating code when explicitly asked for a summary), Colang dynamically interrupts and regenerates the appropriate formatted string without requiring an explicit physical retry API loop.

### 4. Sandboxing & Interception: OpenShell Hypervisor
Applying dynamic enterprise OS-controls around standard Python processing.
- **Execution Mechanism:** The Python application does not run as a normal child task. It is spawned by `nemoclaw execute` leveraging `clone()` syscall flags `CLONE_NEWUSER`, `CLONE_NEWPID`, and `CLONE_NEWNET`.
- **Syscall Blocking (Landlock & Seccomp):** A raw C-binary wrapper intercepts system calls using `ptrace`. Policies mapped from `/etc/nemoclaw/policy.yaml` whitelist specific filesystem trees or internet sockets.
- **Latency & Resource Overhead:** Given context switching out of user-space, `ptrace` evaluations execute roughly ~2-3% overall CPU degradation under heavy IO loads. The C-wrapper footprint sits at a microscopic ~15MB RAM.
- **Failure Mode Interception:** If the Python agent attempts to initialize a bind socket (`bind()`) or delete a file outside the whitelisted path (`unlink()`), the kernel traps it. Instead of a generic `EACCES` error crashing the Python script, NemoClaw's wrapper captures the panic point, maintaining process memory context synchronously.

### 5. Infrastructure: Docker & Kata MicroVM
Adds pure hardware insulation beneath the software interception layer.
- **Execution Mechanism:** Even with OpenShell's Landlock filters, the NemoClaw parent process remains cordoned within a container leveraging the `runtime: kata-runtime` virtualization boundary.
- **Redundant Safety Guarantee:** If an adversarial exploit manages to break through `seccomp` and corrupt the Landlock mapping out of user-space, the execution remains trapped inside a hardware VT-x microVM managed by QEMU, completely isolating the host kernel block from pivot. Total static memory overhead increases by an inescapable ~200MB virtualization tax.

### 6. Observability: Split Audit Mechanism
Provides distinct paths for LLM flow observability and physical security auditing.
- **Execution Mechanism (LLM Traces):** `langfuse-python` SDK is injected directly to the agent code. It yields asynchronous structured traces mapping dialogue prompts, latency logic, and `nemoguardrails` semantic routing boundaries directly to a local Langfuse Postgres DB (consuming roughly ~2GB system RAM baseline).
- **Execution Mechanism (Audit Logic):** Concurrently, NemoClaw emits OS-level JSON-lines specifically concerning access grants, syscall drops, and HITL overrides directly to the host-mounted `/var/log/nemoclaw/audit.log`. 
- **The Split Brain Tax:** Operators have to map the physical syslog payload against the API LLM trace waterfall manually to correlate why exactly an LLM hallucination potentially mapped down into a blocked system call, introducing diagnostic friction.

### 7. Human-In-The-Loop Execution: NemoClaw Web UI
Rather than destroying a process context upon failure, the execution is trapped and paused indefinitely for human resolution.
- **Execution Mechanism:** Hits an unapproved `Ptrace` system call trap. NemoClaw utilizes the kernel hook to simply put the process thread segment to `SLEEP`. 
- **Notification & Routing:** Exposes a local Node.js/React API (port `8085` weighing ~80MB fixed RAM). Interceptor streams the metadata specifying the trapped command execution block.
- **Intervention Flow:** A human views the web dashboard. Clicking "Approve" triggers NemoClaw to inject `SIGCONT` via the BPF map manipulate engine, writing an ephemeral transient `allow` rule specifically for that localized execution thread, returning control cleanly to the Python layer without the agent even realizing it was paused.
