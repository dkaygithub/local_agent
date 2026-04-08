# Architecture Design: ResonantOS (Setup 1)

**KEY QUESTIONS FOR REVIEW:**
- How are fake API keys rotated and synced between ResonantOS and IronCurtain?

## System Flow & Deep Technical Specifications

The Resonant Curtain architecture acts as a deterministic flow where nothing is left to chance probabilistic LLM generation. 

### 1. Pre-Flight (Supply Chain): Trivy Static Scanner
During infrastructure initialization and daily audits, Trivy scans the foundational code stack.
- **Execution Mechanism:** Deployed as both a pre-execution hook in the deploy script and a persistent host-level `systemd` timer invoking a transient container.
- **Image Source:** `ghcr.io/aquasec/trivy:latest`
- **Execution Schedule:** Runs blocking scans on every deployment. Background audits run daily via cron (`0 3 * * *`).
- **Resource Overhead:** CPU peaks at ~1.5 - 2.0 vCPUs during scanning. Memory footprint is strictly bounded to ~512MB. Negligible overhead when idle.
- **Notification & Logging:** Outputs are serialized to JSON and piped via Fluent Bit to the local Elasticsearch observability cluster. 
- **Startup Blocking Policy:** Strictly halts the agent Docker container boot sequence if *any* `CRITICAL` CVE (CVSS score > 9.0) is detected in the base OS or Python dependency tree.
- **False Positive Expectation:** Historically ~5-8%, mostly stemming from upstream Alpine backports not matching primary NVD tracker statuses.

### 2. Pre-Flight (Supply Chain): LLM Guard Integrity Checks
Validates the physical models and artifacts prior to and during runtime.
- **Execution Mechanism:** Runs as a persistent, localized API service (`dstack/llm-guard:latest`) connected via internal Docker bridge.
- **Resource Overhead:** Requires 2-4 vCPUs continuously. Memory overhead sits around ~2GB to hold the smaller auxiliary semantic routing models (e.g., ONNX formatting models) in memory.
- **Hash Validation:** Upon startup, it computes the SHA-256 hash of the loaded foundational `.gguf` weights against a verified local manifest. 
- **Failure Mode:** If the hash mismatches (indicating model poisoning via malicious tensors), LLM Guard returns `exit 1`. The primary agent container, bound by a Docker `depends_on: condition: service_healthy` check, will completely fail to boot.

### 3. Ingestion (Input Security): ResonantOS Shield (YARA)
Acts as an infinitely fast, deterministic firewall for inbound prompts or retrieved RAG documents.
- **Execution Mechanism:** A native Python integration (`yara-python` C-extensions) embedded directly inside the ResonantOS primary process space.
- **Rule Definitions:** Strict text matching and regex heuristics mounted dynamically from `/app/config/yara_rules/prompts.yar` to allow hot-reloading without container restarts.
- **Latency & Resource Overhead:** Sub-millisecond latency (<15ms per prompt). Virtually zero memory overhead (~50MB).
- **Incident Routing:** A triggered rule immediately generates a structured `SECURITY_ALERT` payload pushed to the ResonantOS Guardian, broadcasting over WebSockets to the Mission Control UI.
- **Efficacy Stats:** False positive rates are near 0% because YARA matches strictly to known static payloads. However, it lacks semantic understanding, meaning novel or highly obfuscated jailbreaks might pass through (necessitating the downstream alignment engine).

### 4. Inference & Execution: ResonantOS Logician
The deterministic cognitive engine forcing output structures.
- **Execution Mechanism:** Datalog inference engine layered over the core LLM execution thread. Maps LLM raw string generation into bounded JSON graphs.
- **Resource Overhead:** Demands 1-3GB dynamically generated RAM explicitly for managing graph state and context trees depending on dialogue history.
- **Enforcement Protocol:** The LLM's payload is captured in-memory before yielding downstream. The Logician checks every mapped `<key>` and `<value_type>` against its mandatory business logic graph. 
- **Self-Correction & Exhaustion:** If the payload violates constraints (e.g., outputs an array where a nested object is required), Logician silently drops the packet and automatically prompts the LLM to rewrite based on the traceback error. Allowed max internal retries is 3.
- **Failure State:** Upon the 4th failure, Logician halts the transaction completely, returning a hard system fault to the internal API instead of a hallucinated output.

### 5. Infrastructure: Kata Container Isolation
Provides hardware-level separation for the primary logic agent.
- **Execution Mechanism:** Specified via `runtime: kata-runtime` in Docker Compose. The Docker daemon proxies the workload to `containerd-shim-kata-v2`, launching a lightweight QEMU/Cloud-Hypervisor MicroVM.
- **Resource Overhead:** Introduces a fixed memory tax of ~150-200MB per container to run the guest kernel. Computational overhead creates roughly a ~2-5% degradation on raw I/O.
- **Network Boundaries:** `network_mode: none` physically removes the eth0 virtual adapter inside the VM namespace. Only the loopback interface (`lo`) and mounted socket pathways exist.
- **Support Links:** [Kata Architecture Deep Dive](https://katacontainers.io/docs/architecture/)

### 6. Authorization: IronCurtain Socket Proxy & HITL
The sole gateway to the outside world, enforcing Role-Based Access Controls and api-key swaps.
- **Execution Mechanism:** A compiled Go binary container (`ironcurtain/proxy:latest`) listening on an `AF_UNIX` socket mounted as a shared volume (`/var/run/ironcurtain/proxy.sock`). 
- **Latency & Resource Overhead:** Native Go throughput keeps routing latency under 5ms. Memory footprint is tiny (~30MB max). 
- **Credential Swap Logic:** The proxy maintains an in-memory mapped hash-table. When the agent submits `Bearer sk-fake-local-agent-key-1234`, the proxy traps it, drops the fake header, retrieves the real token from local HashiCorp Vault (or encrypted environment variables), and forwards the request.
- **Human-In-The-Loop Execution:** If the proxy flags an endpoint mapping as `require_approval: true` (e.g., POST requests to a database), the Go routine parks the HTTP context.
- **Intervention Flow:** IronCurtain streams a Server-Sent Event (SSE) to the desktop notification bus. If the operator approves via the portal, the context resumes and the request is fired. If no operator responds within 300 seconds (5 minutes), the context expires and a `403 Forbidden` is returned synchronously to the waiting agent socket.
