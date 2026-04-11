# nemoclaw_agent

NemoClaw runs **natively on WSL2** and manages the OpenShell/K3s sandbox infrastructure
directly via Docker. The CLI (`nemoclaw`, `openshell`) live at `~/.local/bin/` on the host.
The Docker setup in this directory is kept as a fallback shell environment.

## Prerequisites

- Docker Desktop running with WSL2 backend
- `openshell-cluster-nemoclaw` container running (started by `nemoclaw onboard`)

## Normal workflow (WSL2 native)

```bash
# Start the UI port forward (binds localhost:18789)
openshell forward start --background 0.0.0.0:18789 bruiser

# Open in browser
#   http://localhost:18789

# Check sandbox health
nemoclaw bruiser status

# Stop the forward when done
openshell forward stop 18789 bruiser
```

## Send a message from CLI

```bash
# From inside the sandbox (openclaw CLI)
nemoclaw bruiser exec -- openclaw agent --agent main --local -m "hello world"
```

## First-time install (WSL2)

If the native CLIs are missing:

```bash
# Install nemoclaw + openshell
curl -fsSL https://nvidia.com/nemoclaw.sh | bash -s -- --yes-i-accept-third-party-software

# Run onboarding (interactive — creates the openshell-cluster-nemoclaw container)
nemoclaw onboard
```

Config persists in `~/.nemoclaw/` and `~/.config/openshell/`.

## Docker fallback shell

The Docker setup is useful for running commands inside the sandbox environment
without `nemoclaw onboard` (config comes from the mounted volumes).

```bash
# Drop into a shell with nemoclaw available
docker compose run --rm nemoclaw bash

# Run the interactive onboarding wizard
docker compose run --rm nemoclaw nemoclaw onboard
```

## Policy management

Network policies are defined in `policies.yaml` (config-as-code) and persisted
by the OpenShell cluster. To force a policy resync after a cluster restart:

```bash
# From inside the nemoclaw container
/fix-policies.sh
```

See `AGENTS.md` for the deny-by-default proxy, WebSocket policy requirements,
and WSL2/Docker networking notes.
