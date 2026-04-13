# NemoClaw Agent - Developer & Agent Guide

This document contains critical architectural insights and troubleshooting lessons learned while setting up and debugging the NemoClaw sandbox environment. Future developers and AI agents should consult this document before modifying network configurations, proxy policies, or the deployment stack.

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
If `nemoclaw bruiser connect` hangs indefinitely, or if policies appear to be "applied" in the CLI but the proxy inside the sandbox is still returning `403 Forbidden`:
- The gRPC `watch stream` between the OpenShell Kubernetes server and the sandbox pod has likely dropped or entered a corrupted state due to long uptime or networking timeouts.
- **The Fix:** Restart the K3s cluster container: `docker restart openshell-cluster-nemoclaw`. Wait for it to become healthy before reconnecting.

## 3. Persistent Configuration (Config-as-Code)
NemoClaw and OpenShell strictly separate their ephemeral container state from configuration metadata. The core configurations and network policies live natively in persistent host directories:
- `~/.nemoclaw/` — Stores UI state, API keys, and sandbox definitions
- `~/.config/openshell/` — Stores active proxy network configurations, TLS PKI, and gateway configs

Once a policy (like `discord`, `npm`, `pypi`, `brave`, `github`) is applied once, it is permanently stored in these directories. Restarting the `openshell-cluster-nemoclaw` container automatically boots the agent with the exact identical configurations.

## 4. Debugging Scripts
Any Python or shell scripts written for diagnostics or one-off fixes must be saved to `/dbg/` in the project root (i.e. `local_agent/dbg/`) before executing them. This preserves a record of what was run and why. Do not run inline scripts via `--command` without first writing the file to `/dbg/`.

## 5. Discord Bot & WebSocket Connectivity
Node.js (and by extension `discord.js`) does **not** natively obey external `HTTP_PROXY` or `HTTPS_PROXY` environmental variables for its WebSocket (`wss://`) traffic without specific dependency patching (like `global-agent`).

However, NemoClaw handles this gracefully via transparent interception.
- **Requirement:** For this interception to catch the traffic, the DNS lookup for the target (`gateway.discord.gg`) **must succeed** inside the pod.
- **IPv4 Priority (CRITICAL):** Docker/K3s networking causes IPv6 DNS lookups to fail or time out in Node, producing an `AggregateError` and preventing the Discord WebSocket from ever connecting. The gateway process **must** be started with `NODE_OPTIONS=--dns-result-order=ipv4first` in its environment to force reliable IPv4 resolution.
- **How to apply:** When restarting the openclaw gateway manually, always prefix the command:
  ```bash
  NODE_OPTIONS=--dns-result-order=ipv4first openclaw gateway run --force --port 18789 > /tmp/gateway.log 2>&1 &
  ```

## 6. openclaw.json Is Read-Only (Landlock)
The sandbox filesystem uses Landlock to enforce:
- **Read-only:** `/sandbox/.openclaw/` (includes `openclaw.json`, the main config file)
- **Read-write:** `/sandbox/.openclaw-data/`, `/tmp/`

This means:
- The **"Update Now" button** and **`config.set`** in the Control UI will always fail with `EACCES`.
- **`openclaw configure`** is blocked inside the sandbox shell (nemoclaw intercepts it and prints an error).
- **`openclaw gateway install`** fails because it needs systemd (not available in the pod).
- All config changes to `openclaw.json` must be made as root via `kubectl exec`:
  ```bash
  openshell doctor exec -- kubectl exec -n openshell bruiser -- sh -c "..."
  ```

## 7. Updating OpenClaw
The in-UI "Update Now" button and `openclaw update --yes` both fail in this environment (read-only filesystem / no detected package manager). The correct update path:

```bash
# Step 1: Install new version as root (bypasses Landlock)
openshell doctor exec -- kubectl exec -n openshell bruiser -- npm i -g openclaw@latest

# Step 2: Restart the gateway to pick up the new binary
# (see Section 8 for restart procedure)
```

## 8. Gateway Restart Procedure
Systemd is not available inside the bruiser pod. `openclaw gateway restart` and `openclaw gateway install` will fail. To restart:

### Step 1: Start the gateway
```bash
openclaw gateway run
```
Always include `NODE_OPTIONS=--dns-result-order=ipv4first` in the environment (see Section 5).

**CRITICAL:** When starting the gateway via `kubectl exec` (which runs as root with `HOME=/root`), you **must** set `HOME=/sandbox` so openclaw can find its config at `/sandbox/.openclaw/openclaw.json`. Without this, the gateway fails with "Missing config":
```bash
HOME=/sandbox NODE_OPTIONS=--dns-result-order=ipv4first openclaw gateway run --port 18789
```

### Step 2: Get the new token
After restart, retrieve the new token to re-authenticate:
```bash
openclaw dashboard
```
This prints the dashboard URL and token. Use the token for the Control UI login and for the SSH tunnel's `--token` flag.

### Step 3: Kill stale SSH tunnels and reconnect
If the old SSH tunnel is still bound to the port:
```bash
fuser -k 18789/tcp
```
Then re-establish the tunnel with the new token.

## 9. Control UI Authentication
After a fresh install or gateway restart, the Control UI at `http://localhost:18789` uses **token auth**. Retrieve the token with:

```bash
openclaw dashboard
```

Or from outside the sandbox:
```bash
openshell sandbox exec -n bruiser -g nemoclaw -- grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc
```

Paste the token value into the login page. The same token is used in the SSH tunnel's `--token` flag. The `dangerouslyDisableDeviceAuth` workaround from the old Docker setup is no longer needed or present.

## 10. Inference Proxy
The openclaw `inference` provider uses `baseUrl: "https://inference.local/v1"` with `apiKey: "unused"`. This is OpenShell's internal inference router — it intercepts requests via the egress proxy and injects the real API key (stored in `~/.nemoclaw/credentials.json`) when forwarding to the upstream provider (e.g., Google's Gemini API at `generativelanguage.googleapis.com`).

- `inference.local` only resolves through the proxy (`HTTPS_PROXY=http://10.200.0.1:3128`)
- To test the inference endpoint directly: `HTTPS_PROXY=http://10.200.0.1:3128 curl -sk https://inference.local/v1/models`
- A `400 status code (no body)` from an agent run usually means the inference proxy is misconfigured or the API key is invalid — test with the curl above before debugging openclaw further.
