# NemoClaw Agent - Developer & Agent Guide

This document contains critical architectural insights and troubleshooting lessons learned while setting up and debugging the NemoClaw sandbox environment. Future developers and AI agents should consult this document before modifying network configurations, proxy policies, or the deployment stack.

## 0. Do NOT Use Raw kubectl Commands
**Never run `kubectl delete pod`, `kubectl exec`, or any direct kubectl manipulation** against the NemoClaw/OpenShell cluster. The sandbox pod has init processes (DNS proxy, policy sync agents, Landlock setup) that are provisioned during `nemoclaw onboard` and will not be recreated if the pod is deleted and rescheduled by K3s. Deleting the pod via kubectl leaves the sandbox in a broken state (no DNS, no transparent proxy interception) that cannot be fixed without a full destroy + re-onboard.

**Instead, always use:**
- `nemoclaw <name> destroy` to tear down a sandbox
- `nemoclaw onboard` to recreate it
- `nemoclaw <name> policy-add` / `openshell policy set` to manage policies
- `openshell forward` to manage port forwarding
- `docker restart openshell-cluster-nemoclaw` only for the gRPC watch stream fix (this restarts the K3s cluster, not individual pods)

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

### Non-Interactive Onboarding
NemoClaw supports fully non-interactive onboarding via environment variables. This is the preferred way to recreate a sandbox after a destroy, avoiding the multi-step interactive wizard. The script `onboard.sh` in this repo automates this.

**Usage:**
```bash
./onboard.sh              # standard onboard
./onboard.sh --recreate   # destroy + recreate existing sandbox
```

**How it works:** The script reads API keys from `~/.nemoclaw/credentials.json` (populated by the first interactive onboard) and exports them alongside the sandbox configuration as env vars. Key variables:

| Env Var | Purpose |
|---|---|
| `NEMOCLAW_NON_INTERACTIVE=1` | Skip all interactive prompts |
| `NEMOCLAW_SANDBOX_NAME` | Sandbox name (e.g. `bruiser`) |
| `NEMOCLAW_PROVIDER` | Inference provider (`gemini`, `openai`, `anthropic`, etc.) |
| `NEMOCLAW_MODEL` | Model ID (e.g. `gemini-3-flash-preview`) |
| `GEMINI_API_KEY` | API key for the provider (env var name matches `credentialEnv` from onboard session) |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_SERVER_ID` | Discord guild ID for workspace access |
| `DISCORD_REQUIRE_MENTION` | Whether bot requires @mention (`true`/`false`) |
| `BRAVE_API_KEY` | Brave Search API key |
| `NEMOCLAW_POLICY_MODE` | `custom` (explicit list) or `suggested` (defaults) |
| `NEMOCLAW_POLICY_PRESETS` | Comma-separated preset names (e.g. `pypi,npm,discord,brave`) |
| `NEMOCLAW_ACCEPT_THIRD_PARTY_SOFTWARE=1` | Skip the third-party software acceptance prompt |

**To update the config:** Edit `onboard.sh` directly — it is the source of truth for the sandbox's non-interactive configuration. Secrets are never stored in the script; they are read from `~/.nemoclaw/credentials.json` at runtime.

## 4. Debugging Scripts
Any Python or shell scripts written for diagnostics or one-off fixes must be saved to `/dbg/` in the project root (i.e. `local_agent/dbg/`) before executing them. This preserves a record of what was run and why. Do not run inline scripts via `--command` without first writing the file to `/dbg/`.

## 5. Discord Bot & WebSocket Connectivity
The Discord gateway WebSocket (`wss://gateway.discord.gg`) fails with `AggregateError` / WebSocket 1006 when launched normally inside the sandbox. This is a known issue: [NVIDIA/NemoClaw#1738](https://github.com/NVIDIA/NemoClaw/issues/1738).

**Root cause:** The sandbox sets `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` + `NODE_USE_ENV_PROXY=1` on the gateway worker process (UID 998). Node.js's `EnvHttpProxyAgent` sends forward-proxy requests to `10.200.0.1:3128` for WebSocket connections, but the L7 proxy expects CONNECT tunnels. The `ws` module itself doesn't read proxy env vars — but undici's `EnvHttpProxyAgent` interferes at the HTTP level. REST API calls (`discord.com/api/...`) work fine; only the WebSocket upgrade to `gateway.discord.gg` fails.

**Fix:** A Node.js preload script (`discord-proxy-fix.cjs`) that:
1. Patches `https.request` to establish proper CONNECT tunnels for `*.discord.gg`
2. Patches `WebSocket.send` to replace the `openshell:resolve:env:DISCORD_BOT_TOKEN` placeholder with the real token (since L7 proxy token rewriting can't operate inside an encrypted CONNECT tunnel)

**How to apply:** The `onboard.sh` script handles this automatically. For manual restart:
```bash
# Upload the fix + real token into sandbox /tmp/
openshell sandbox upload bruiser discord-proxy-fix.cjs /tmp/
echo "$REAL_TOKEN" | openshell sandbox exec -n bruiser -- sh -c 'cat > /tmp/.discord-token'

# Start gateway with the preload (must run as root to bypass NODE_OPTIONS block)
openshell sandbox exec -n bruiser -- \
  env HOME=/sandbox \
      NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs --dns-result-order=ipv4first' \
  openclaw gateway run --port 18789
```

**Verification:** Check for `[proxy-fix] CONNECT tunnel for gateway.discord.gg` and `[proxy-fix] Token replaced in WebSocket send` in stdout. OCSF logs should show `NET:UPGRADE [INFO] gateway.discord.gg:443`.

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
Systemd is not available inside the bruiser pod. `openclaw gateway restart` and `openclaw gateway install` will fail. Use `openshell sandbox exec` to manage the gateway:

### Step 1: Stop existing gateway
```bash
openshell sandbox exec -n bruiser -- openclaw gateway stop
# Force-kill if still running (no kill/pkill in sandbox):
openshell sandbox exec -n bruiser -- python3 -c "import os; [os.kill(int(p), 9) for p in os.listdir('/proc') if p.isdigit() and b'openclaw-gateway' in open(f'/proc/{p}/cmdline','rb').read()]"
```

### Step 2: Start the gateway with Discord fix
The gateway must be started via `openshell sandbox exec` (runs as root) to bypass the `NODE_OPTIONS` block. `HOME=/sandbox` is required so openclaw finds its config:
```bash
openshell sandbox exec -n bruiser -- \
  env HOME=/sandbox \
      NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs --dns-result-order=ipv4first' \
  openclaw gateway run --port 18789
```
See Section 5 for details on the Discord fix. If Discord is not needed, omit `--require /tmp/discord-proxy-fix.cjs`.

### Step 3: Restart port forward + get new token
```bash
openshell forward stop 18789 bruiser
openshell forward start --background "0.0.0.0:18789" bruiser
openshell sandbox exec -n bruiser -- grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc
```
Paste the token into the Control UI login page.

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
