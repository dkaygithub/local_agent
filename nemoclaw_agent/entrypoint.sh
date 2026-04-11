#!/bin/bash
set -e

# === WSL2 / Docker Desktop Workaround ===
# The underlying `nemoclaw` CLI assumes it can reach the local OpenShell Gateway
# (which is exposed on the host's port 8080) at 127.0.0.1:8080. Since we abandoned 
# `network_mode: "host"`, we use socat to pipe 127.0.0.1:8080 to the host interface.
socat TCP-LISTEN:8080,fork,reuseaddr TCP:host.docker.internal:8080 &

# Auto-connect the sandbox port forward on startup.
# NEMOCLAW_SANDBOX is set in docker-compose.yml to the name from onboarding.
if [ -n "${NEMOCLAW_SANDBOX}" ]; then
  echo ""
  echo "  Connecting sandbox '${NEMOCLAW_SANDBOX}' (port 18789)..."
  nemoclaw "${NEMOCLAW_SANDBOX}" connect &

  # === WSL2 / Docker Desktop Workaround ===
  # `nemoclaw ... connect` runs a Kubernetes `kubectl port-forward`, which forcefully binds
  # to the internal loopback interface (127.0.0.1:18789). Docker's published ports feature 
  # ignores loopback bindings and will block connections. We spawn a background socat
  # proxy to listen on all interfaces (0.0.0.0:18790) and funnel it down to the loopback.
  socat TCP-LISTEN:18790,fork,bind=0.0.0.0 TCP:127.0.0.1:18789 &

  sleep 3

  if kill -0 $! 2>/dev/null; then
    echo "  ✓ Port forward active → http://127.0.0.1:18789"
  else
    echo "  ⚠ connect exited early — run 'nemoclaw ${NEMOCLAW_SANDBOX} connect' manually"
  fi
  echo ""
fi

exec "$@"
