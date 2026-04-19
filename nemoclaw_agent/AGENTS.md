# NemoClaw Agent - Developer & Agent Guide

This document contains critical architectural insights and troubleshooting lessons learned while setting up and debugging the NemoClaw sandbox environment. Future developers and AI agents should consult this document before modifying network configurations, proxy policies, or the deployment stack.

## -1. Search Upstream Before Improvising

When you hit any weirdness — error messages, unexpected sandbox state, config that won't apply, symlinks that openclaw refuses to cooperate with — **search the `NVIDIA/NemoClaw` and `openclaw` GitHub repos for existing issues and PRs before inventing a workaround**. This stack moves fast and most pain points already have a published fix, an in-flight PR, or a commented workaround on the tracking issue. Reinventing a patch is often worse than waiting on, or cherry-picking, the upstream one.

```bash
gh search issues --repo NVIDIA/NemoClaw "<keyword>" --include-prs --limit 20
gh api repos/NVIDIA/NemoClaw/issues/<N>/comments --jq '.[] | {user:.user.login, body}'
gh api repos/NVIDIA/NemoClaw/pulls/<N>/files --jq '.[] | {filename,patch}'
```

Good search terms: the exact error string, file paths from the traceback, config keys being rejected, the subsystem name from the log. Check both open and closed issues — closed ones often carry the workaround that's now fixed upstream but isn't in your deployed version yet.

If you mirror an upstream PR as a local patch (like §14 pi-ai or §16 exec-approvals), **record the issue/PR number + a "retire when merged" note in AGENTS.md** so future-you knows to delete the patch instead of carrying it forever.

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

**`requireMention` behavior:** The default config sets `requireMention: true` for the guild. The bot will silently skip messages (log: `discord: skipping guild message`) unless you @mention it. To change this, set `DISCORD_REQUIRE_MENTION=false` in `onboard.sh` before onboarding.

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

> **Warning:** `npm i -g openclaw@latest` overwrites the patched dist and drops both live-applied patches. Re-run after upgrading:
> - `dbg/patch-pi-ai.sh` — Gemini 3 `thoughtSignature` round-trip (§14)
> - `dbg/patch-exec-approvals-path.sh` — exec-approvals symlink workaround (§16)

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
      NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs --require /tmp/inference-body-capture.cjs --dns-result-order=ipv4first' \
  openclaw gateway run --port 18789
```
See Section 5 for details on the Discord fix. If Discord is not needed, omit `--require /tmp/discord-proxy-fix.cjs`.

> **Every `--require` must exist inside the sandbox.** Node fails `MODULE_NOT_FOUND` on preload and exits *before* logging, so the gateway silently doesn't start. `restart-gateway.sh` uploads both `/tmp/discord-proxy-fix.cjs` (from `nemoclaw_agent/`) and `/tmp/inference-body-capture.cjs` (from `dbg/`) to keep NODE_OPTIONS in sync. If you hand-run the command above, upload both first via `openshell sandbox upload bruiser <file> /tmp/`. Missing-upload regressions hide behind the script's "Gateway ready" message — see §17 for the failure signature and the host-side log location.
>
> The `inference-body-capture.cjs` preload is diagnostic (logs every `inference.local` POST to `/tmp/inference-all.log` + `/tmp/inference-errors.log`). It was wired in for the §14 Gemini 3 debug. The pi-ai patch is the live fix; the openclaw-side upstream PR that makes the fix permanent is [openclaw/openclaw#66949](https://github.com/openclaw/openclaw/pull/66949).
>
> **TODO — retire after openclaw#66949 merges:** once #66949 lands and a release pinned to it ships to bruiser (verify with `gh api repos/openclaw/openclaw/pulls/66949 --jq '{state,merged,title}'` then `openshell sandbox exec -n bruiser -- openclaw --version`), drop the `--require /tmp/inference-body-capture.cjs` from `restart-gateway.sh`, remove the matching `openshell sandbox upload` of `dbg/inference-body-capture.cjs`, and delete the `INFERENCE_CAPTURE` plumbing so startup stops producing the two `/tmp/inference-*.log` files. The source file in `dbg/` can stay — it's still useful to re-enable ad hoc for future inference debugging.

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
- **Gemini free tier quota:** The free tier allows only **20 requests per day** per model. A single conversation with context compaction can burn through this in minutes. If you see `⚠️ API rate limit reached` in Discord or `RESOURCE_EXHAUSTED` / `429` in logs, check your Gemini API key is from a paid project at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- **Updating the API key:** Edit `~/.nemoclaw/credentials.json`, then re-run `onboard.sh --recreate` to propagate the new key to the OpenShell provider's rewrite table.

## 11. Credential Sync & Provider Rewrite Table
The `openshell:resolve:env:` placeholder system requires the OpenShell gateway to inject provider credentials into the L7 proxy's rewrite table. A bare `nemoclaw onboard` creates the provider but **doesn't always trigger the sync**. Running `nemoclaw <name> connect` (interactive) triggers a full sandbox session recovery which syncs credentials.

> **Warning:** `nemoclaw <name> connect` has no working `--command` flag. Passing `--command "..."` hangs indefinitely — the invocation never completes and nothing runs. For non-interactive commands in the sandbox, use `openshell sandbox exec -n <name> -- <cmd>` instead.

If inference or Discord auth fails after onboard with placeholder-related errors, open an interactive `nemoclaw bruiser connect` session briefly and exit — that alone triggers the sync.

## 12. Sandbox Shell Limitations
The sandbox container is minimal — many standard tools are missing:
- **No `kill`, `pkill`, `ps`, `fuser`, `lsof`** — Use python3 `/proc` scanning to find/kill processes (see Section 8).
- **No `pgrep`** — Same workaround.
- **`openshell sandbox exec` rejects newlines in arguments** — All python/shell one-liners must be on a single line.
- **`openshell sandbox upload` treats the dest as a directory if it looks like a filename** — Upload to a directory path (e.g., `/tmp/`) and let it infer the basename, not to a full file path.
- **`npm install` may OOM (exit 137)** — The sandbox has limited memory. Avoid large npm installs inside the sandbox.

## 13. HEB MCP Bridge (host-side OAuth, sandbox-side MCP)

Exposes H-E-B grocery tools to the sandbox via MCP without letting OAuth tokens enter it. Project at `~/projects/local_agent/heb/`.

**Architecture.** An Express + `StreamableHTTPServerTransport` MCP server runs in Docker on the host at `0.0.0.0:4321`, serving vendored tool definitions from upstream `ihildy/heb-sdk-unofficial`. Tokens live at `~/projects/local_agent/heb/tokens.json` (mode 0600), bind-mounted into the container at `/secrets/tokens.json`. Token refresh happens inside the container on demand and atomic-writes back to the same file (with a fallback to in-place overwrite because Docker bind-mounted single files can't be replaced via `rename(2)`). The sandbox talks to the server via `mcporter` → `http://host.docker.internal:4321/mcp`.

**Token isolation invariant.** Tokens never enter the sandbox filesystem or environment. Only MCP traffic crosses the boundary. Verify with:
```bash
openshell sandbox exec -n bruiser -- sh -c \
  'grep -rl "access_token\|refresh_token" /sandbox /tmp 2>/dev/null || echo CLEAN'
```

**One-time bootstrap (host).** `npx tsx bootstrap.ts` runs PKCE login: it prints an H-E-B OAuth URL (mobile client `myheb-ios-prd`, redirect is `com.heb.myheb://oauth2redirect` — a mobile deep link, so the browser shows a protocol-handler error after login), then prompts for the full redirect URL pasted from the browser's address bar. It exchanges the code and writes `tokens.json`. Then `docker compose up -d --build`.

**Egress policy — narrow SSRF override.** `host.docker.internal` resolves to a private IP, which the egress proxy's SSRF engine blocks by default. The `heb` block in the bruiser policy uses `access: full` (L4 passthrough — Streamable HTTP needs SSE so the L7 REST inspector would break streams) plus the `allowed_ips` per-endpoint override for the single private IP (`192.168.65.254` on Docker Desktop WSL2). Binaries whitelist: `node`, `mcporter`. This is one hostname, one port, one IP, three binaries — nothing more.

**Persistence across `--recreate`.** `/usr/local/bin/mcporter` lives on the pod's read-only image layer and is wiped on sandbox recreate; `/sandbox/.openclaw-data/mcporter.json` is persistent. `onboard.sh` reinstalls mcporter (via `openshell doctor exec -- kubectl exec ... npm i -g mcporter`) and idempotently re-registers the `heb` server on every run.

**Troubleshooting.**
- `403` via `HTTP Tunneling` from sandbox → policy out of sync or `allowed_ips` missing. Re-apply via `openshell policy set bruiser --policy ../dbg/bruiser-policy-heb.yaml` (from `nemoclaw_agent/`).
- `Already connected to a transport` 500 from `/mcp` → `McpServer.connect()` can only be called once per McpServer; the server creates a fresh instance per mcp-session-id.
- Refresh failures → `docker logs heb-mcp` on the host. Expired `refresh_token` means re-run bootstrap.

## 14. Gemini 3 `thoughtSignature` Patch (temporary, until upstream PR merges)

Gemini 3 rejects the second turn of any tool-calling conversation with a 400 whose body reads `Function call is missing a thought_signature in functionCall parts. ... position 44`. Bruiser reaches Gemini through `inference.local` (gateway-routed OpenAI-compat endpoint), so the actual offender is **pi-ai**, not openclaw: `@mariozechner/pi-ai/dist/providers/openai-completions.js` does not capture `tool_calls[].extra_content.google.thought_signature` during streaming and does not re-emit it on outgoing tool_calls. The signature gets dropped between turns and Google rejects any subsequent request.

**Earlier misdiagnosis.** An openclaw-side overlay (`solve-thought-signature` branch, boundary-aware transport patch) was prepared first. It never ran: pi-coding-agent wraps `streamSimple` before openclaw sees it, so `resolveEmbeddedAgentStreamFn`'s `currentStreamFn === streamSimple` check is false and openclaw's boundary-aware transport is skipped. Bundle instrumentation (`dbg/instrument-bundle.sh`, `/tmp/sig-trace.log`) confirmed neither `extractGoogleThoughtSignature` nor `injectToolCallThoughtSignatures` is ever invoked in the live path. Keep the openclaw patch — it's correct for direct transport users — but the live fix is in pi-ai.

**Symptom.** Bruiser @mentions that invoke tools (HEB MCP, brave, any follow-up) show typing indicator, never reply. No Discord error, just silence. The first inference POST succeeds; the second 400s with the `position 44` body above.

**Upstream PRs.**
- pi-ai: branch `fix/gemini-thought-signature-round-trip-openai-completions` in `~/projects/local_agent/pi-mono/` (commit on branch adds streaming capture, outgoing `extra_content.google.thought_signature`, and a `reasoning.encrypted` guard so the OpenAI reasoning_details path is unaffected; unit-tested in `packages/ai/test/openai-completions-gemini3-thought-signature.test.ts`).
- openclaw: branch `solve-thought-signature` in `~/projects/local_agent/openclaw/`, filed as [openclaw/openclaw#66949](https://github.com/openclaw/openclaw/pull/66949) (boundary-aware transport sig capture/inject). Inert until pi-coding-agent's stream wrapping is reworked, but kept because it's still correct for non-wrapped callers. When #66949 merges and ships, the §8 `inference-body-capture.cjs` preload can be retired (see the TODO under §8 Step 2).

**Apply the live fix.** `dbg/patch-pi-ai.sh` is idempotent (creates `.prepatch` backup on first run, restores + reapplies on subsequent runs). It edits the deployed pi-ai inside the bruiser sandbox as root:
```bash
cd ~/projects/local_agent
./dbg/patch-pi-ai.sh
./nemoclaw_agent/restart-gateway.sh
```

Target file inside sandbox:
```
/usr/local/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/providers/openai-completions.js
```

Why `openshell doctor exec -- kubectl exec` (as root) and not `openshell sandbox exec`:
- `openshell sandbox exec` runs as `uid=998(sandbox)` and can't write under `/usr/local/lib/node_modules/`.
- `openshell doctor exec -- kubectl exec -n openshell bruiser` runs as `uid=0(root)` and bypasses that restriction without needing a rebuild.

**Re-apply after any `npm install` that touches pi-ai.** `openclaw@<new>` upgrades (Section 7) overwrite the patched dist; re-run `dbg/patch-pi-ai.sh`. The script detects prior application via its `/* PI_AI_GEMINI_SIG_PATCH */` sentinel and is safe to run repeatedly — it will re-baseline from `.prepatch` and re-apply.

**Verify.**
```bash
# Confirm both hunks present in the deployed file.
openshell doctor exec -- kubectl exec -n openshell bruiser -- \
  grep -c 'PI_AI_GEMINI_SIG_PATCH' \
  /usr/local/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/providers/openai-completions.js
# Expect: 2
```

Then send a tool-triggering @mention (HEB store lookup — e.g. "set nutty brown as our store") via Discord or `openclaw agent --message "..."` and confirm the reply posts.

**When to retire this section.** When the pi-ai upstream PR merges and openclaw ships a release pinned to the fixed pi-ai version, delete this section and drop the warning from Section 7.

## 15. Exec Approvals — Discord Native Delivery

Bruiser uses Discord-native exec approvals with `target: channel` — prompts post as Block Kit buttons in the originating channel (the thread/channel where Nemo was @mentioned). Only user IDs in `channels.discord.execApprovals.approvers` can resolve them; other members get an ephemeral "not authorized" reply.

Config lives in the gateway openclaw.json (read-only inside sandbox — edit via `openshell doctor exec -- kubectl exec` as root, per Section 6). The shape is:

```yaml
channels:
  discord:
    execApprovals:
      enabled: true
      target: channel          # post in originating channel (not DM)
      approvers: ["<discord-user-id>", ...]
```

The sandbox ships `/sandbox/.openclaw/exec-approvals.json` as a symlink to `/sandbox/.openclaw-data/exec-approvals.json` (Landlock layout). Openclaw refuses to write through symlinks, so **§16's path patch is a prerequisite** — without it, no exec ever completes and the native approval flow never gets a chance to fire.

**How to apply (or re-apply after `--recreate`):** `apply-approvals-config.sh` is idempotent and patches the openclaw.json routing block. `onboard.sh` runs §16's dist-path patch + this script before the gateway starts, so cold reboots + sandbox recreates preserve the full setup. To change the approver list, edit `APPROVERS_JSON` in `apply-approvals-config.sh` and re-run it + `restart-gateway.sh`.

**Distinguishing real approval prompts from agent improvisation:** real prompts are Block Kit embeds posted by the bot itself (not in Nemo's persona voice), include command text + cwd + agent id fields, and carry interactive Approve/Deny buttons tied to an approval id. Prose messages asking you to `rm` something or edit a file are the agent roleplaying — ignore them.

### TODO — Dedicated approvals-only channel with forwarding

The built-in `target` enum is `dm | channel | both`; it reuses the *originating* channel, not a fixed approvals room. To route all exec approvals to a single pinned `#nemo-approvals` channel (independent of where the agent was invoked), we need one of:

1. **Constrain invocation surface.** Set `channels.discord.commands.allowFrom` / `commands.ownerAllowFrom` so the only guild channel Nemo listens in *is* `#nemo-approvals`. Then "originating channel" == approvals channel by construction. Simple, but forces all agent chat into one room.
2. **Approval forwarding extension.** openclaw's `docs/tools/exec-approvals.md` §"Approval forwarding to chat channels" describes forwarding prompts to arbitrary channels and resolving them with `/approve` / `/deny`. Supports a dedicated approvals room while keeping the agent usable across multiple channels. Needs an extension/config we haven't wired up yet — investigate the forwarding config knobs and what it takes to target a fixed channel ID.

Pick (2) if we want multi-channel agent use with centralized approval review; pick (1) if single-channel operation is acceptable.

## 16. Exec-Approvals Path Patch (temporary, until NemoClaw PR #1823 merges)

With the `.openclaw` / `.openclaw-data` split, NemoClaw ships `/sandbox/.openclaw/exec-approvals.json` as a symlink into the writable `.openclaw-data/`. Openclaw's `assertSafeExecApprovalsDestination` refuses to write through any symlink, and the exec pre-flight path writes to this file on every tool call. Result: every tool exec fails with

```
[tools] exec failed: Refusing to write exec approvals via symlink:
                     /sandbox/.openclaw/exec-approvals.json
```

and Discord-native approval prompts (§15) never fire because exec dies before the approval runtime is reached.

**Upstream tracking.**
- Issue: [NVIDIA/NemoClaw#1785](https://github.com/NVIDIA/NemoClaw/issues/1785) — ".openclaw folder split broke exec-approvals.json" (open, bug).
- Fix PR: [NVIDIA/NemoClaw#1823](https://github.com/NVIDIA/NemoClaw/pull/1823) — "fix(image): route exec approvals to .openclaw-data" (open, tested working by the issue reporter on `2026.4.12`).

**Apply the live fix.** `dbg/patch-exec-approvals-path.sh` mirrors PR #1823's approach: it rewrites the hardcoded `~/.openclaw/exec-approvals.json` path to `~/.openclaw-data/exec-approvals.json` across the deployed openclaw dist `*.js` bundles inside the bruiser sandbox (as root via `openshell doctor exec -- kubectl exec`, same mechanism as §14). Idempotent — detects an already-patched dist and no-ops.

```bash
cd ~/projects/local_agent
./dbg/patch-exec-approvals-path.sh
./nemoclaw_agent/restart-gateway.sh
```

Target files (4 bundles at time of writing; script scans generically):
```
/usr/local/lib/node_modules/openclaw/dist/prompt-select-styled-*.js
/usr/local/lib/node_modules/openclaw/dist/bash-tools-*.js
/usr/local/lib/node_modules/openclaw/dist/exec-approvals-effective-*.js
/usr/local/lib/node_modules/openclaw/dist/exec-approvals-*.js
```

**Re-apply after any `npm i -g openclaw@...`.** Section 7's upgrade path overwrites the dist; re-run `dbg/patch-exec-approvals-path.sh` afterwards (alongside §14's pi-ai patch).

**Baked into onboarding.** `onboard.sh` runs this patch before the gateway starts, so `--recreate` and cold reboots pick it up automatically. Don't rely on the sandbox image alone until PR #1823 merges.

**Verify.**
```bash
openshell sandbox exec -n bruiser -- sh -c \
  'grep -R --include="*.js" -c "\.openclaw-data/exec-approvals.json" \
   /usr/local/lib/node_modules/openclaw/dist 2>/dev/null | \
   grep -v ":0$" | wc -l'
# Expect: >= 4
```

Then send a tool-triggering @mention via Discord — you should see a Block Kit approval prompt with Approve/Deny buttons in the channel you @mentioned from (only approvers listed in §15 can click).

**When to retire this section.** Periodically check PR #1823's state:
```bash
gh api repos/NVIDIA/NemoClaw/pulls/1823 --jq '{state,merged,title}'
```
Once it's merged and the bruiser base image has been rebuilt with it (next `nemoclaw onboard --recreate` pulls a fresh image), delete `dbg/patch-exec-approvals-path.sh`, drop the `onboard.sh` hook, and remove this section.

## 17. Recovery After Docker Desktop Restart / Cold Boot

§2 covers the gRPC watch-stream hang where the K3s container is up but the sandbox isn't syncing. This section covers the other common stall: **Docker Desktop itself was closed or restarted**, taking the `openshell-cluster-nemoclaw` K3s container with it. Symptoms and sequence:

### Diagnosing "is bruiser even up?"

Run these four probes, in order — they triage the failure layer without touching state:

```bash
# 1. Gateway reachable on the host?
curl -sS -o /dev/null -w "gateway HTTP %{http_code}\n" http://localhost:18789/
# 2. Host-side port-forward process alive?
openshell forward list
# 3. K3s cluster + sandbox reachable?
openshell sandbox exec -n bruiser -- echo ok
# 4. Sandbox definition still registered?
nemoclaw list
```

Decision tree based on what fails:

| Probe 3 fails with `transport error / Connection refused` | K3s container is down (Docker Desktop closed or cluster container stopped). Start Docker Desktop and wait for `openshell-cluster-nemoclaw` to come up — if it has a restart policy it comes back on its own. Don't `nemoclaw onboard --recreate`; the sandbox definition persists in `~/.nemoclaw/` and `~/.config/openshell/` (§3). |
| Probe 3 passes, probe 2 shows `dead` or missing, probe 1 gives `Connection refused` | Only the host-side SSH port-forward died. The gateway inside may still be alive. Run `restart-gateway.sh` — it stops + respawns the gateway and the forward atomically. |
| Probe 3 passes, probe 1 gives `curl: (52) Empty reply from server` or `SSL_ERROR_SYSCALL` | Port-forward is serving but the gateway inside is in a wedged / half-dead state. Same fix: `restart-gateway.sh`. |
| All probes pass but Discord bot doesn't reply | See §14 (Gemini 3 thought_signature) and §16 (exec-approvals symlink) — the gateway is up but tool calls die in a later layer. |

### Docker CLI is not always present in WSL

On this machine, `docker` resolves to "The command 'docker' could not be found in this WSL 2 distro" from a plain `bash` shell — the Docker Desktop WSL integration is only wired into specific distros. You can't run `docker restart openshell-cluster-nemoclaw` from here. Workarounds, in order of preference:

1. Start Docker Desktop from Windows and let Docker's default restart policy bring `openshell-cluster-nemoclaw` back on its own.
2. Run `docker restart openshell-cluster-nemoclaw` from PowerShell, or from a WSL distro that has the integration enabled.
3. Toggle "WSL integration" in Docker Desktop → Settings → Resources for this distro, then `docker` becomes available here too.

Do **not** try to work around this by `nemoclaw onboard --recreate`'ing — that destroys sandbox state (policies, mcporter registration, the discord token cache's in-sandbox copy) when a `docker restart` would have been sufficient.

### `restart-gateway.sh` readiness check

The script now curls `localhost:18789` after the port-forward comes up and exits nonzero if it doesn't get a `200 / 302 / 401`. Before this check, a gateway that died on Node preload (e.g. a `NODE_OPTIONS --require` pointing at a file that wasn't uploaded) would still produce "Gateway ready. Control UI: http://localhost:18789" because the script only measured port openness. If the new check fails, the last 40 lines of `/tmp/gateway-start.log` (host-side, *not* inside the sandbox) are printed to stderr — that's where Node's preload crash traceback lands. Inside-sandbox `/tmp/gateway.log` only gets written once the gateway process is alive enough to log, which means crashes during `--require` are invisible there.

### Non-obvious things that bit us on 2026-04-17 recovery

- **`restart-gateway.sh` had a missing upload.** The script's NODE_OPTIONS included `--require /tmp/inference-body-capture.cjs` (added in the §14 debug session) but never uploaded the file. After cluster restart, `/tmp/` in the sandbox was empty, the preload 404'd, the gateway crashed on every start, and the script still reported "Gateway ready." Fix: the upload is now part of `restart-gateway.sh` alongside `discord-proxy-fix.cjs`. Lesson: every entry in `NODE_OPTIONS --require` needs a matching upload step, and any change to NODE_OPTIONS must be paired with the upload in the same commit.
- **`openclaw gateway stop` prints "Gateway service disabled" but may not actually kill the process.** The script's follow-up `python3 /proc` kill loop is what reliably reaps stuck gateways. Don't trust the first command's success message alone.
- **The gateway PID persisting across a Docker Desktop restart does not mean it's healthy.** We observed pid 74 inside the sandbox after Docker came back up; port 18789 accepted TCP connections but returned empty replies. A full `restart-gateway.sh` (stop → spawn → re-forward) is safer than trying to tickle the existing process back to life.
- **Control UI "origin not allowed" WS 1008 errors in `/tmp/gateway-start.log` are harmless** — they come from stale browser tabs reconnecting from the wrong origin, not from the gateway being broken.
