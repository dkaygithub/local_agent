#!/usr/bin/env bash
# onboard.sh — Non-interactive NemoClaw onboarding from saved config.
#
# Reads API keys from ~/.nemoclaw/credentials.json (populated by a prior
# interactive onboard). Recreates the bruiser sandbox with the same
# provider, model, policies, and messaging channels.
#
# Usage:
#   ./onboard.sh                  # standard onboard
#   ./onboard.sh --recreate       # destroy + recreate existing sandbox
#
# Prerequisites:
#   - Docker Desktop running with WSL2 backend
#   - ~/.nemoclaw/credentials.json contains GEMINI_API_KEY, DISCORD_BOT_TOKEN, BRAVE_API_KEY

set -euo pipefail

CREDS="$HOME/.nemoclaw/credentials.json"

if [ ! -f "$CREDS" ]; then
  echo "Error: $CREDS not found. Run 'nemoclaw onboard' interactively first to store credentials."
  exit 1
fi

# Read secrets from the credential store (jq-free, uses python)
read_cred() {
  python3 -c "import json,sys; print(json.load(open('$CREDS')).get('$1',''))"
}

# ── Sandbox config ──────────────────────────────────────────
export NEMOCLAW_NON_INTERACTIVE=1
export NEMOCLAW_ACCEPT_THIRD_PARTY_SOFTWARE=1
export NEMOCLAW_SANDBOX_NAME=bruiser

# ── Inference ───────────────────────────────────────────────
export NEMOCLAW_PROVIDER=gemini
export NEMOCLAW_MODEL=gemini-3-flash-preview
export GEMINI_API_KEY="$(read_cred GEMINI_API_KEY)"

# ── Messaging channels ─────────────────────────────────────
export DISCORD_BOT_TOKEN="$(read_cred DISCORD_BOT_TOKEN)"
export DISCORD_SERVER_ID=1492375679722066020
export DISCORD_REQUIRE_MENTION=false

export BRAVE_API_KEY="$(read_cred BRAVE_API_KEY)"

# ── Policies ────────────────────────────────────────────────
export NEMOCLAW_POLICY_MODE=custom
export NEMOCLAW_POLICY_PRESETS=pypi,npm,discord,brave

# ── Run ─────────────────────────────────────────────────────
EXTRA_FLAGS=()
if [[ "${1:-}" == "--recreate" ]]; then
  EXTRA_FLAGS+=(--recreate-sandbox)
fi

echo "Starting non-interactive onboard for sandbox '$NEMOCLAW_SANDBOX_NAME'..."
echo "  Provider: $NEMOCLAW_PROVIDER  Model: $NEMOCLAW_MODEL"
echo "  Policies: $NEMOCLAW_POLICY_PRESETS"
echo "  Discord:  server $DISCORD_SERVER_ID"

nemoclaw onboard --non-interactive "${EXTRA_FLAGS[@]}"

# ── Post-onboard: apply Discord CONNECT tunnel fix ──
#
# The OpenShell L7 proxy (10.200.0.1:3128) intercepts all sandbox egress.
# Node.js's EnvHttpProxyAgent sends forward-proxy requests for WebSocket
# connections to gateway.discord.gg, but the proxy expects CONNECT tunnels.
# This causes AggregateError / WebSocket 1006 failures.
# See: https://github.com/NVIDIA/NemoClaw/issues/1738
#
# Fix: a Node.js preload script (discord-proxy-fix.cjs) that:
#   1. Patches https.request to use CONNECT tunnels for *.discord.gg
#   2. Patches WebSocket.send to inject the real bot token (since the
#      openshell:resolve:env: placeholder can't be rewritten inside an
#      encrypted CONNECT tunnel)
#
# The fix is loaded via NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs'.
# OpenClaw blocks NODE_OPTIONS for the sandbox user, so we use
# openshell sandbox exec (runs as root) to start the gateway.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DISCORD_TOKEN="$(read_cred DISCORD_BOT_TOKEN)"

echo ""
echo "Syncing credentials via nemoclaw connect..."
nemoclaw "$NEMOCLAW_SANDBOX_NAME" connect --command "echo credentials-synced && exit" || true

echo ""
echo "Applying Discord CONNECT tunnel fix (issue #1738)..."

# Upload fix script and real token to sandbox /tmp/
# Note: openshell sandbox upload treats the dest as a directory if it ends with
# a filename, so we upload to /tmp/ and let it infer the basename.
echo "$DISCORD_TOKEN" > /tmp/.discord-token
openshell sandbox upload "$NEMOCLAW_SANDBOX_NAME" "$SCRIPT_DIR/discord-proxy-fix.cjs" /tmp/
openshell sandbox upload "$NEMOCLAW_SANDBOX_NAME" /tmp/.discord-token /tmp/
rm -f /tmp/.discord-token

# Stop existing gateway
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- openclaw gateway stop 2>/dev/null || true
sleep 2
# Force-kill if still running (no kill/pkill in sandbox, openshell sandbox exec
# rejects newlines in args, so use a one-liner)
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- python3 -c "import os; [os.kill(int(p), 9) for p in os.listdir('/proc') if p.isdigit() and b'openclaw-gateway' in open(f'/proc/{p}/cmdline','rb').read()]" 2>/dev/null || true
sleep 1

# Start gateway with the fix preloaded (runs as root via sandbox exec)
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
  env HOME=/sandbox \
      NODE_OPTIONS='--require /tmp/discord-proxy-fix.cjs --dns-result-order=ipv4first' \
  openclaw gateway run --port 18789 > /tmp/gateway-start.log 2>&1 &

echo "  Waiting for gateway to start..."
sleep 5

# Restart port forward
openshell forward stop 18789 "$NEMOCLAW_SANDBOX_NAME" 2>/dev/null || true
openshell forward start --background "0.0.0.0:18789" "$NEMOCLAW_SANDBOX_NAME"

# Show fix status from gateway log
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- sh -c "head -15 /tmp/gateway.log 2>/dev/null" || true
echo ""

# Print dashboard token
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
  sh -c "grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc" 2>/dev/null || true
echo ""
echo "Done. Open http://localhost:18789"
