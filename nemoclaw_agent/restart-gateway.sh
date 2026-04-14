#!/usr/bin/env bash
# restart-gateway.sh — (Re)start the OpenClaw gateway with the Discord
# CONNECT-tunnel fix preloaded. Idempotent; safe to run any time the bot
# stops responding.
#
# Usage:
#   ./restart-gateway.sh              # uses bruiser + creds from ~/.nemoclaw/credentials.json
#   SANDBOX=foo ./restart-gateway.sh  # override sandbox name
#
# Called at the end of onboard.sh, so onboard.sh doesn't duplicate this
# logic. If you only need to recover a dead gateway, run this directly.
#
# Background: the OpenShell L7 proxy (10.200.0.1:3128) intercepts sandbox
# egress, but Node.js's EnvHttpProxyAgent sends forward-proxy requests for
# WebSocket connections — the proxy expects CONNECT tunnels, causing
# WebSocket 1006 / AggregateError failures (issue #1738). The fix script
# (discord-proxy-fix.cjs) patches https.request to use CONNECT tunnels and
# WebSocket.send to inject the real bot token (openshell:resolve:env:
# placeholders can't be rewritten inside an encrypted CONNECT tunnel).
# OpenClaw blocks NODE_OPTIONS for the sandbox user, so the gateway must
# be started via `openshell sandbox exec` (runs as root).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOX="${SANDBOX:-bruiser}"
CREDS="${CREDS:-$HOME/.nemoclaw/credentials.json}"
FIX_SCRIPT="$SCRIPT_DIR/discord-proxy-fix.cjs"
GATEWAY_PORT="${GATEWAY_PORT:-18789}"

if [ ! -f "$CREDS" ]; then
  echo "Error: $CREDS not found. Run nemoclaw onboard interactively first." >&2
  exit 1
fi
if [ ! -f "$FIX_SCRIPT" ]; then
  echo "Error: $FIX_SCRIPT not found." >&2
  exit 1
fi

DISCORD_TOKEN="$(python3 -c "import json; print(json.load(open('$CREDS')).get('DISCORD_BOT_TOKEN',''))")"
if [ -z "$DISCORD_TOKEN" ]; then
  echo "Error: DISCORD_BOT_TOKEN not found in $CREDS." >&2
  exit 1
fi

echo "Skipping nemoclaw connect credential-sync step."
# `nemoclaw connect --command "..."` is not a supported invocation — the flag
# appears accepted but the command hangs forever. Credentials are synced by
# `onboard.sh`; if they're truly out of date, run an interactive
# `nemoclaw "$SANDBOX" connect` session manually and exit.

echo "Uploading Discord CONNECT-tunnel fix + token into sandbox /tmp/..."
# openshell sandbox upload treats dest as a directory when it ends with /,
# so we upload into /tmp/ and let it infer basenames.
TOKEN_TMP="$(mktemp)"
trap 'rm -f "$TOKEN_TMP"' EXIT
printf '%s' "$DISCORD_TOKEN" > "$TOKEN_TMP"
# Preserve the `.discord-token` basename the preload script expects.
cp "$TOKEN_TMP" "/tmp/.discord-token"
openshell sandbox upload "$SANDBOX" "$FIX_SCRIPT"       /tmp/
openshell sandbox upload "$SANDBOX" "/tmp/.discord-token" /tmp/
rm -f "/tmp/.discord-token"

echo "Stopping existing gateway (if any)..."
openshell sandbox exec -n "$SANDBOX" -- openclaw gateway stop 2>/dev/null || true
sleep 2
# Force-kill stragglers (no kill/pkill in sandbox; exec rejects newlines).
openshell sandbox exec -n "$SANDBOX" -- python3 -c "import os; [os.kill(int(p), 9) for p in os.listdir('/proc') if p.isdigit() and b'openclaw-gateway' in open(f'/proc/{p}/cmdline','rb').read()]" 2>/dev/null || true
sleep 1

echo "Starting gateway with preload (as root via sandbox exec)..."
# Fully detach: nohup + redirect all three fds + setsid so the child doesn't
# keep this script's pipe open (otherwise callers like `./onboard.sh | tail`
# never return).
nohup setsid openshell sandbox exec -n "$SANDBOX" -- \
  env HOME=/sandbox \
      NODE_OPTIONS="--require /tmp/discord-proxy-fix.cjs --dns-result-order=ipv4first" \
  openclaw gateway run --port "$GATEWAY_PORT" \
  </dev/null >/tmp/gateway-start.log 2>&1 &
disown || true

echo "  Waiting for gateway to start..."
sleep 5

echo "Restarting port forward on $GATEWAY_PORT..."
openshell forward stop "$GATEWAY_PORT" "$SANDBOX" 2>/dev/null || true
# --background spawns an ssh-proxy daemon that inherits the caller's stderr;
# redirect fully so the script can exit even when invoked via a pipe.
openshell forward start --background "0.0.0.0:$GATEWAY_PORT" "$SANDBOX" \
  </dev/null >/tmp/openshell-forward.log 2>&1

echo ""
echo "Gateway log (first 15 lines):"
openshell sandbox exec -n "$SANDBOX" -- sh -c "head -15 /tmp/gateway.log 2>/dev/null" || true
echo ""

# Dashboard token hint.
openshell sandbox exec -n "$SANDBOX" -- \
  sh -c "grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc" 2>/dev/null || true
echo ""
echo "Gateway ready. Control UI: http://localhost:$GATEWAY_PORT"
