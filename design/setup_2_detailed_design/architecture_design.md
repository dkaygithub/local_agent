# Architecture Design: LangGraph Ecosystem (Setup 2)

**KEY QUESTIONS FOR REVIEW:**
- Will Guardrails AI schemas be dynamically generated or hardcoded per state transition?

## System Flow & Deep Technical Specifications

The LangGraph architecture relies on state machine orchestration combined with local Model Context Protocol (MCP) gateways to establish permissions and cognitive barriers.

### 1. Pre-Flight (Supply Chain): Trivy Cross-Language Scanner
Due to the composite nature of this stack (Python for the agent, Go for the Gateway), static scanning covers multiple ecosystems.
- **Execution Mechanism:** Rather than exclusively relying on Docker container scans, Trivy runs natively as a local `pre-commit` git hook against the filesystem (`trivy fs /workspace/src`) to catch dependencies prior to Docker compilation.
- **Container Configuration:** Native binary or transient `ghcr.io/aquasec/trivy:latest` mapping local volumes.
- **Resource Overhead:** Heavy CPU spike (allocating ~2 vCPUs) while pulling standard NVD databases and unpacking Go `mod` graphs and Python `pip` resolution trees. Can require up to 1GB of transient memory space.
- **Startup Blocking Policy:** Fails any compilation run locally if a `HIGH` vulnerability exists within the complex LangChain/Graph pipeline tree, as these SDKs change rapidly. 
- **Troubleshooting Details:** Developer documentation relies on explicit NVD matching and `.trivyignore` exception files for known upstream bugs without a current patch.

### 2. Ingestion (Input Security): LLM Guard Pre-Processing Node
Rather than sitting completely outside the architecture, LLM Guard is explicitly routed as the first physical Node in LangGraph.
- **Execution Mechanism:** LangGraph initializes with a `pre_process_input` node making internal HTTP `POST` requests to the local `dstack/llm-guard:latest` scanner API.
- **Resource Overhead:** The external LLM Guard container runs consistently at 1.5GB RAM specifically to keep the Jailbreak and Toxicity tensor structures in memory, saving ~2 seconds of cold-start latency per request. Node processing overhead takes roughly ~120-200ms depending on prompt length.
- **Configuration Tolerances:** PII detection (e.g. `Presidio` integration) is explicitly disabled in the Guard YAML configuration. It only traps and cleans malicious command injection structures to prevent scrubbing the local user's personal datasets.

### 3. Graph Execution: LangGraph Engine & Checkpointer
The local orchestrator processing the state loop.
- **Execution Mechanism:** Executing as the primary Python thread mapped via Docker compose (`docker-compose up langgraph-agent`).
- **Data Persistence:** The core difference from Setup 1: LangGraph serializes the entire physical state of the agent after *every* node execution. This creates local overhead on a mapped SQLite3 database (`/app/data/checkpoints.db`).
- **Resource Overhead:** Baseline Python instantiation takes ~150MB. State serialization creates intermittent disk I/O spikes and requires roughly ~50-100MB RAM overhead depending on the complexity of the graph state dict held in memory.
- **State Capabilities:** This checkpoint architecture provides absolute persistence. You can freeze the execution graph, kill the Docker container, spin it up 3 days later, and inject a "Resume" command to restart generation with the exact previous context.

### 4. Cognitive Alignment: Guardrails AI Validators
Reining in local model probabilistic drift by enforcing exact payload maps.
- **Execution Mechanism:** Deeply integrated as functional Python decorators placed onto the LangGraph generation nodes.
- **Implementation Strategy:** Developers must code physical `Pydantic` schema models matching the required LLM output and pass them into the `guardrails` context object for that node block.
- **Latency & Resource Overhead:** Generates notable Python AST parsing and regex matching costs on the CPU. Validating complex multi-layered JSON generation consumes ~30-50MB RAM during generation spikes.
- **Re-Generation Fallbacks:** If the local LLM generates a hallucinated field or an incorrect type, Guardrails AI synchronously emits a `ValidationError`. LangGraph graphs are hardcoded to trap this error context and fire a retry edge route back to the LLM node, appending the error traceback into the prompt to "fix" its mistake. (Typically capped at 3 retries).

### 5. Gateway Authorization: Bifrost MCP Proxy
The rigid tool-execution boundary executing logic on behalf of the agent.
- **Execution Mechanism:** A highly performant, statically compiled Go binary (`ghcr.io/bifrost/bifrost-gateway:latest`) listening internally on `8000`.
- **Latency & Resource Overhead:** Given Go's goroutine execution context, latency mapping MCP commands to physical tool executions is profoundly low (<2ms). Memory footprint is extraordinarily negligible (~20MB fixed baseline) even under heavy concurrent execution loads from multiple agents.
- **Routing Policies:** Bifrost reads a declarative configuration schema identifying the exact Virtual JWT or API key the instance holds, matching it against specific MCP context scopes (e.g., `["files:read", "database:write"]`). 
- **Notification Routing:** Unapproved scope or budget exhaustions are immediately blocked (HTTP 401/403) back to LangGraph's executing tool node, forcing LangGraph into an exception route.

### 6. Unified Tracing: Langfuse & OTEL Multiplexing
Central observability avoiding the "split-brain" disconnect between agent logic and proxy boundaries.
- **Execution Mechanism:** A centralized `langfuse-server` Docker container with a required Postgres backbone.
- **Resource Overhead:** Due to complex hierarchical DB relations for traces, the Langfuse setup requires a significant localized tax (~2GB RAM baseline, ~0.5 vCPUs under load) strictly for the Postgres ingestion.
- **Instrumentation Streams:** 
  1. Python LangGraph logs all edge traversal via native `langfuse_callback` SDK modules.
  2. Go Bifrost simultaneously fires hardware OpenTelemetry (OTEL) traces summarizing tool invocation lengths and error limits via gRPC to the `/api/public/otel` context.
- **Distributed Magic:** These streams are tied together natively via standard W3C HTTP headers. Bifrost reads the injected `traceparent` payload arriving from LangGraph's HTTP request and tags its physical telemetry trace with the exact same ID, perfectly bridging the UI trace graph between "Python Code Thought Process" and "Go Physical Execution".
