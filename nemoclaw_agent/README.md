# nemoclaw_agent

NemoClaw runs **natively on WSL2** and manages the OpenShell/K3s sandbox infrastructure directly via Docker. The CLI tools (`nemoclaw`, `openshell`) live at `~/.local/bin/` on the WSL2 host.

## Prerequisites

- Docker Desktop running with WSL2 backend
- Node.js installed in WSL2

## First-Time Install

```bash
# Install nemoclaw + openshell natively in WSL2 (requires a real TTY — run in your terminal)
curl -fsSL https://nvidia.com/nemoclaw.sh | bash

# Run onboarding (interactive — opens browser for auth, creates the K3s cluster container)
nemoclaw onboard
```

Onboarding will:
1. Start the `openshell-cluster-nemoclaw` Docker container (the K3s cluster)
2. Create a sandbox named `bruiser`
3. Prompt for your inference API key (Gemini), Discord bot token, Brave API key, etc.
4. Configure network policies and start the openclaw gateway

Config persists in `~/.nemoclaw/` and `~/.config/openshell/`.

## Normal Workflow

```bash
# Start the UI port forward (binds localhost:18789)
openshell forward start --background 0.0.0.0:18789 bruiser

# Open the Control UI in your browser
#   http://localhost:18789
#   (login with the token from: grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc)

# Check sandbox health
nemoclaw bruiser status

# Stream sandbox logs
nemoclaw bruiser logs --follow

# Drop into a shell inside the sandbox
nemoclaw bruiser connect

# Stop the forward when done
openshell forward stop 18789 bruiser
```

## Gateway Management

The openclaw gateway runs inside the bruiser sandbox pod. Systemd is not available, so `openclaw gateway restart` does not work. To restart manually:

```bash
nemoclaw bruiser connect --command \
  "NODE_OPTIONS=--dns-result-order=ipv4first openclaw gateway run --force --port 18789 > /tmp/gateway.log 2>&1 &"
```

**Important:** Always include `NODE_OPTIONS=--dns-result-order=ipv4first`. Without it, Discord WebSocket connections will fail with `AggregateError` due to IPv6 DNS failures in the K3s network.

## Updating OpenClaw

The "Update Now" button in the UI does not work (read-only filesystem). Update via root kubectl:

```bash
# Install latest openclaw as root inside the sandbox
openshell doctor exec -- kubectl exec -n openshell bruiser -- npm i -g openclaw@latest

# Then restart the gateway (see above)
```

## Troubleshooting

### `nemoclaw bruiser connect` hangs
The gRPC watch stream between OpenShell and the sandbox pod has gone stale (usually after hours of uptime). Fix:
```bash
docker restart openshell-cluster-nemoclaw
# Wait ~30 seconds for it to become healthy, then retry
```

### Discord bot not responding (AggregateError in logs)
Node.js is trying IPv6 DNS for `gateway.discord.gg` and failing. The gateway must be restarted with `NODE_OPTIONS=--dns-result-order=ipv4first` (see Gateway Management above).

### Control UI shows "origin not allowed"
The `allowedOrigins` in `/sandbox/.openclaw/openclaw.json` only includes `http://127.0.0.1:18789` by default. To add `localhost`:
```bash
openshell doctor exec -- kubectl exec -n openshell bruiser -- python3 -c "
import json
path='/sandbox/.openclaw/openclaw.json'
cfg=json.load(open(path))
cfg['gateway']['controlUi']['allowedOrigins']=['http://127.0.0.1:18789','http://localhost:18789']
json.dump(cfg,open(path,'w'),indent=2)
print('done')
"
# Then restart the gateway
```

### "400 status code (no body)" on agent runs
The inference proxy is failing. Test it directly:
```bash
openshell doctor exec -- kubectl exec -n openshell bruiser -- sh -c \
  "HTTPS_PROXY=http://10.200.0.1:3128 curl -sk https://inference.local/v1/models"
```
If that returns models, the proxy is healthy and the issue is elsewhere. If it fails, check that the API key is stored: `nemoclaw credentials list`.

### Config changes from the UI fail silently
`/sandbox/.openclaw/` is Landlock read-only for the sandbox user. All config edits must be done as root via `openshell doctor exec -- kubectl exec -n openshell bruiser -- ...`.

## See Also

`AGENTS.md` — detailed architectural notes on the proxy, Landlock filesystem policy, Discord WebSocket setup, inference routing, and gateway restart procedures.
