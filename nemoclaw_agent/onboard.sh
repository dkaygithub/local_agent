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

# ── Post-onboard: Discord CONNECT-tunnel fix + gateway start ──
# Delegated to restart-gateway.sh so the logic lives in one place and can
# be rerun standalone when the gateway dies (issue #1738 context lives in
# that script's header).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOX="$NEMOCLAW_SANDBOX_NAME" CREDS="$CREDS" \
  "$SCRIPT_DIR/restart-gateway.sh"

# ── Post-onboard: install mcporter + register HEB MCP bridge ──
#
# The HEB MCP server runs on the host at http://host.docker.internal:4321
# (see ~/projects/local_agent/heb/). OAuth tokens stay on the host; the
# sandbox only speaks MCP over the network. Egress is opened by the
# `heb` policy block with allowed_ips for the host's private IP (SSRF
# override). See AGENTS.md §13.
#
# `mcporter` itself lives under /usr/local/bin (image layer) and is wiped
# on --recreate, so we reinstall it every run. The mcporter config under
# /sandbox/.openclaw-data/ persists across recreates.

MCPORTER_CFG=/sandbox/.openclaw-data/mcporter.json
HEB_MCP_URL=http://host.docker.internal:4321/mcp

echo ""
echo "Installing mcporter + registering HEB MCP server..."
openshell doctor exec -- kubectl exec -n openshell bruiser -- \
  npm i -g mcporter >/dev/null 2>&1 || echo "  (mcporter install skipped or already present)"

# Idempotent add — `mcporter config add` fails if the server already exists,
# so we check first.
if ! openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
     mcporter --config "$MCPORTER_CFG" list 2>/dev/null | grep -q '^- heb '; then
  openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
    mcporter --config "$MCPORTER_CFG" config add heb --url "$HEB_MCP_URL" || true
fi
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
  mcporter --config "$MCPORTER_CFG" list heb 2>&1 | tail -3 || true

# Print dashboard token
openshell sandbox exec -n "$NEMOCLAW_SANDBOX_NAME" -- \
  sh -c "grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc" 2>/dev/null || true
echo ""
echo "Done. Open http://localhost:18789"
