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
# Diagnostic preload that captures inference.local request/response bodies.
# Wired into NODE_OPTIONS below; MUST be uploaded into the sandbox or Node
# aborts preload with MODULE_NOT_FOUND and the gateway never starts.
INFERENCE_CAPTURE="$SCRIPT_DIR/../dbg/inference-body-capture.cjs"
GATEWAY_PORT="${GATEWAY_PORT:-18789}"

if [ ! -f "$CREDS" ]; then
  echo "Error: $CREDS not found. Run nemoclaw onboard interactively first." >&2
  exit 1
fi
if [ ! -f "$FIX_SCRIPT" ]; then
  echo "Error: $FIX_SCRIPT not found." >&2
  exit 1
fi
if [ ! -f "$INFERENCE_CAPTURE" ]; then
  echo "Error: $INFERENCE_CAPTURE not found." >&2
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
openshell sandbox upload "$SANDBOX" "$FIX_SCRIPT"         /tmp/
openshell sandbox upload "$SANDBOX" "$INFERENCE_CAPTURE"  /tmp/
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
      NODE_OPTIONS="--require /tmp/discord-proxy-fix.cjs --require /tmp/inference-body-capture.cjs --dns-result-order=ipv4first" \
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

# Real readiness check — poll the forwarded port for a 2xx/3xx response.
# Without this, a gateway that crashed on preload (e.g. missing NODE_OPTIONS
# file → MODULE_NOT_FOUND) still reaches the "Gateway ready" line because the
# sleep-then-forward sequence only verifies TCP reachability, not serving.
echo "Verifying gateway is actually serving on $GATEWAY_PORT..."
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://localhost:$GATEWAY_PORT/" || true)"
  if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "401" ]; then
    break
  fi
  sleep 1
done
if [ "$code" != "200" ] && [ "$code" != "302" ] && [ "$code" != "401" ]; then
  echo "Error: gateway did not become ready (last HTTP=$code). Last startup log:" >&2
  tail -40 /tmp/gateway-start.log >&2 2>/dev/null || true
  exit 1
fi

# Patch-liveness check — Docker Desktop restarts / `nemoclaw onboard --recreate`
# reschedule the sandbox pod from a fresh image layer, which wipes the live
# patches for pi-ai (§14, Gemini 3 thoughtSignature) and exec-approvals
# (§16, symlink). With the gateway up but patches missing, every tool call
# produces the "typing, no response" symptom — no error, just silence.
#
# Verify before declaring ready. Set PATCH_CHECK=off to bypass (not
# recommended except for intentional debugging without the patches).
if [ "${PATCH_CHECK:-on}" != "off" ]; then
  echo "Verifying live patches are in place..."
  pi_ai_hits="$(openshell doctor exec -- kubectl exec -n openshell "$SANDBOX" -- \
    grep -c 'PI_AI_GEMINI_SIG_PATCH' \
    /usr/local/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/providers/openai-completions.js \
    2>/dev/null | tr -dc '0-9' || true)"
  approvals_hits="$(openshell sandbox exec -n "$SANDBOX" -- \
    sh -c 'grep -R --include="*.js" -l "\.openclaw-data/exec-approvals.json" /usr/local/lib/node_modules/openclaw/dist 2>/dev/null | wc -l' \
    2>/dev/null | tr -dc '0-9' || true)"
  pi_ai_hits="${pi_ai_hits:-0}"
  approvals_hits="${approvals_hits:-0}"
  patch_fail=0
  if [ "$pi_ai_hits" -lt 2 ]; then
    echo "  ✗ §14 pi-ai thoughtSignature patch MISSING ($pi_ai_hits/2 sentinels found)" >&2
    patch_fail=1
  else
    echo "  ✓ §14 pi-ai patch live ($pi_ai_hits sentinels)"
  fi
  if [ "$approvals_hits" -lt 4 ]; then
    echo "  ✗ §16 exec-approvals path patch MISSING ($approvals_hits/≥4 files patched)" >&2
    patch_fail=1
  else
    echo "  ✓ §16 exec-approvals patch live ($approvals_hits files)"
  fi
  if [ "$patch_fail" = "1" ]; then
    echo "" >&2
    echo "Error: one or more live patches are missing. The gateway is running but tool-calling" >&2
    echo "       will silently break (typing indicator, no reply). Reapply with:" >&2
    echo "         cd $(cd "$SCRIPT_DIR/.." && pwd)" >&2
    echo "         ./dbg/patch-pi-ai.sh" >&2
    echo "         ./dbg/patch-exec-approvals-path.sh" >&2
    echo "         ./nemoclaw_agent/restart-gateway.sh" >&2
    echo "       Bypass with PATCH_CHECK=off ./restart-gateway.sh (not recommended)." >&2
    exit 1
  fi
fi

echo ""
echo "Gateway log (first 15 lines):"
openshell sandbox exec -n "$SANDBOX" -- sh -c "head -15 /tmp/gateway.log 2>/dev/null" || true
echo ""

# Dashboard token hint.
openshell sandbox exec -n "$SANDBOX" -- \
  sh -c "grep OPENCLAW_GATEWAY_TOKEN /sandbox/.bashrc" 2>/dev/null || true
echo ""
echo "Gateway ready (HTTP $code). Control UI: http://localhost:$GATEWAY_PORT"
