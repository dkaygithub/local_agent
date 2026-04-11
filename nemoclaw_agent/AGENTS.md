# NemoClaw Agent - Developer & Agent Guide

This document contains critical architectural insights and troubleshooting lessons learned while containerizing and debugging the NemoClaw sandbox environment. Future developers and AI agents should consult this document before modifying network configurations, proxy policies, or the deployment stack.

## 1. Network Policies & The "Deny-by-Default" Proxy
NemoClaw sandboxes use a strict **"deny-by-default"** egress proxy (`10.200.0.1:3128`). If an outbound request receives a `403 Forbidden` or `000` (connection reset) from `curl` tests, it is almost certainly a policy enforcement block.

### Policy Rules
- **Binary Whitelisting:** Policies enforce access based on the specific binary attempting the connection. If you add a host to the policy but fail to add the binary (e.g., `/usr/bin/curl` or `/usr/local/bin/node`) to the `binaries` list block, the proxy will still reject it.
- **Protocol Enforcements (L7 vs L4):**
  - **REST (L7):** `protocol: rest` enforces strict HTTP method/path inspection. This **will break** WebSocket connections, long-lived gRPC streaming, and anything that isn't standard HTTP.
  - **Passthrough (L4):** If the endpoint uses WebSockets (e.g., `gateway.discord.gg`), use `access: full` to bypass L7 inspection and allow raw TCP/WebSocket passthrough. 

## 2. Policy Synchronization & The Watch Stream Bug
OpenShell (the k3s cluster running underneath NemoClaw) syncs policies to the active sandbox pod via a continuous gRPC `watch stream`. 

### The Hang Scenario
If `openshell policy set` hangs indefinitely, or if policies appear to be "applied" in the CLI but the proxy inside the Sandbox is still returning `403 Forbidden`:
- The gRPC `watch stream` between the OpenShell Kubernetes server and the sandbox pod has likely dropped or entered a corrupted state due to Docker-in-Docker networking timeouts.
- **The Fix:** A graceful stack restart (`docker-compose down` followed by `docker-compose up -d`) completely flushes the ephemeral K3s networking state and forces the watch stream to reconnect. 

## 3. Persistent Configuration (Config-as-Code)
Do **not** use brittle `entrypoint.sh` Bash scripts looping over environment variables (e.g., `NEMOCLAW_POLICIES`) to repeatedly execute interactive CLI commands like `nemoclaw policy-add` on startup. 

### Why?
1. The CLI tools are highly interactive and notoriously difficult to script correctly via `echo` and pipes.
2. It's completely unnecessary.

### Native Persistence
NemoClaw and OpenShell strictly separate their ephemeral container state from configuration metadata. The core configurations and network policies live natively in the persistent Docker volume mounts:
- `./nemoclaw-data` -> `/root/.nemoclaw` (Stores UI state, API keys, and Sandbox definitions in `sandboxes.json`)
- `./openshell-data` -> `/root/.config/openshell` (Stores active proxy network configurations, TLS PKI, and Gateway configs)

Once a policy (like `discord`, `npm`, `pypi`, `brave`, `github`) is applied once, it is permanently etched into these volumes. Recreating or restarting the container automatically boots the agent with the exact identical configurations.

## 4. Discord Bot & WebSocket Connectivity
Node.js (and by extension `discord.js`) does **not** natively obey external `HTTP_PROXY` or `HTTPS_PROXY` environmental variables for its WebSocket (`wss://`) traffic without specific dependency patching (like `global-agent`). 

However, NemoClaw handles this gracefully via transparent interception (e.g. `socat`/iptables layer). 
- **Requirement:** For this interception to catch the traffic, the DNS lookup for the target (`gateway.discord.gg`) **must succeed** inside the pod.
- **IPv4 Priority:** Docker networking bugs often cause IPv6 DNS lookups to fail or time out in Node (`getaddrinfo EAI_AGAIN`). Ensure the `NODE_OPTIONS=--dns-result-order=ipv4first` environment variable is active on the `nemoclaw_agent` container to force reliable IPv4 resolution.
