#!/bin/bash
# fix-policies.sh — Restart sandbox pods to force policy resync, then
#                    ensure the required network-policy presets are applied.
#
# SAFE: does NOT destroy the Sandbox CRD or touch onboard config/credentials.
# It only recycles the K8s pods so the openshell-sandbox process restarts
# fresh and re-syncs its policy from the server.
#
# Prerequisites: run from *inside* nemoclaw_agent container (has docker socket).
set -euo pipefail

SANDBOX="${NEMOCLAW_SANDBOX:-bruiser}"
CLUSTER="openshell-cluster-nemoclaw"
KUBE="docker exec ${CLUSTER} kubectl"

# Policies we want applied (space-separated).
POLICIES="${NEMOCLAW_POLICIES:-discord brave npm pypi github}"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  fix-policies.sh — sandbox policy resync         ║"
echo "╚══════════════════════════════════════════════════╝"

# ── 1. Restart the openshell-0 server pod ────────────────────────────
echo ""
echo "▸ Step 1/5: Restarting openshell-0 to clear TLS errors..."
$KUBE delete pod openshell-0 -n openshell --grace-period=10 2>&1 || true
echo "  Waiting for openshell-0 to come back..."
for i in $(seq 1 60); do
  PHASE=$($KUBE get pod openshell-0 -n openshell -o jsonpath='{.status.phase}' 2>/dev/null || echo "Pending")
  READY=$($KUBE get pod openshell-0 -n openshell -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
  if [ "$PHASE" = "Running" ] && [ "$READY" = "true" ]; then
    echo "  ✓ openshell-0 is Running & Ready (${i}s)"
    break
  fi
  [ "$i" -eq 60 ] && echo "  ⚠ Timed out waiting for openshell-0" && exit 1
  sleep 1
done

# ── 2. Restart the bruiser pod (controller will recreate it) ─────────
echo ""
echo "▸ Step 2/5: Recycling ${SANDBOX} pod to force policy resync..."
$KUBE delete pod "${SANDBOX}" -n openshell --grace-period=10 2>&1 || true
echo "  Waiting for ${SANDBOX} pod to come back..."
for i in $(seq 1 90); do
  PHASE=$($KUBE get pod "${SANDBOX}" -n openshell -o jsonpath='{.status.phase}' 2>/dev/null || echo "Pending")
  READY=$($KUBE get pod "${SANDBOX}" -n openshell -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
  if [ "$PHASE" = "Running" ] && [ "$READY" = "true" ]; then
    echo "  ✓ ${SANDBOX} pod is Running & Ready (${i}s)"
    break
  fi
  [ "$i" -eq 90 ] && echo "  ⚠ Timed out waiting for ${SANDBOX}" && exit 1
  sleep 1
done

# Allow the sandbox proxy to fully initialize.
echo "  Waiting 10s for proxy initialization..."
sleep 10

# ── 3. Reconnect the port-forward ────────────────────────────────────
echo ""
echo "▸ Step 3/5: Reconnecting nemoclaw port-forward..."
# Kill any stale port-forward
pkill -f "nemoclaw.*connect" 2>/dev/null || true
sleep 2
nemoclaw "${SANDBOX}" connect &
sleep 5
if kill -0 $! 2>/dev/null; then
  echo "  ✓ Port forward active → http://127.0.0.1:18789"
else
  echo "  ⚠ Port forward did not start — continuing anyway"
fi

# ── 4. Apply missing policy presets ──────────────────────────────────
echo ""
echo "▸ Step 4/5: Applying network policy presets..."
for preset in $POLICIES; do
  # Check if already truly applied (shows ● in the list).
  STATUS=$(nemoclaw "${SANDBOX}" policy-list 2>&1 | grep -E "●.*${preset}" || true)
  if [ -n "$STATUS" ]; then
    echo "  ● ${preset} — already marked applied, re-submitting to force sync..."
    # Find the menu number via the policy-add interactive prompt.
    MENU_NUM=$(echo "" | nemoclaw "${SANDBOX}" policy-add 2>&1 \
      | grep -P "\d+\).*${preset}" \
      | grep -oP "^\s*\d+" \
      | tr -d ' ' || true)
    if [ -n "$MENU_NUM" ]; then
      echo "$MENU_NUM" | nemoclaw "${SANDBOX}" policy-add 2>&1 | tail -1 || true
    fi
  else
    # Not yet applied — find its menu number and apply.
    MENU_NUM=$(echo "" | nemoclaw "${SANDBOX}" policy-add 2>&1 \
      | grep -P "\d+\).*○.*${preset}" \
      | grep -oP "^\s*\d+" \
      | tr -d ' ' || true)
    if [ -n "$MENU_NUM" ]; then
      echo "$MENU_NUM" | nemoclaw "${SANDBOX}" policy-add 2>&1 | tail -1 || true
      echo "  ✓ Applied: ${preset}"
    else
      echo "  ⚠ Preset '${preset}' not found in available list"
    fi
  fi
done

# ── 5. Verify ────────────────────────────────────────────────────────
echo ""
echo "▸ Step 5/5: Verifying connectivity..."
nemoclaw "${SANDBOX}" policy-list 2>&1
echo ""

# Quick proxy test via the sandbox.
echo "  Testing proxy → gateway.discord.gg..."
RESULT=$(echo 'curl -s -o /dev/null -w "%{http_code}" --proxy http://10.200.0.1:3128 --max-time 10 https://gateway.discord.gg 2>&1' \
  | timeout 15 nemoclaw "${SANDBOX}" connect 2>&1 | tail -1 || echo "FAIL")
if echo "$RESULT" | grep -qE "^[23][0-9][0-9]$"; then
  echo "  ✓ Discord gateway reachable (HTTP ${RESULT})"
else
  echo "  ✗ Discord gateway NOT reachable: ${RESULT}"
  echo "    (This may mean the policy draft still hasn't synced.)"
fi

echo ""
echo "Done. Run 'nemoclaw ${SANDBOX} status' to inspect the active policy version."
