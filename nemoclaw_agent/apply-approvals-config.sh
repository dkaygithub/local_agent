#!/usr/bin/env bash
# apply-approvals-config.sh — Enable Discord-native exec approvals on bruiser.
#
# Idempotent. Safe to re-run after `nemoclaw onboard --recreate`.
#
# Scope (intentionally narrow): this script only patches the native-delivery
# routing (`channels.discord.execApprovals`) in openclaw.json. It does NOT
# touch /sandbox/.openclaw/exec-approvals.json — that file is a symlink the
# sandbox image ships, and openclaw's write-guard refuses to cooperate with
# it. Setting host approvals defaults belongs on the documented path:
#
#   openclaw approvals set --gateway --stdin <<EOF ... EOF
#
# which the gateway RPC handles server-side. See AGENTS.md §15 TODO.

set -euo pipefail

SANDBOX="${SANDBOX:-bruiser}"

# Approver Discord user IDs (snowflakes). Edit here to add/remove approvers.
APPROVERS_JSON='["343582385507532802","297777467622686730"]'

echo "Patching channels.discord.execApprovals in openclaw.json..."
openshell doctor exec -- kubectl exec -n openshell "$SANDBOX" -- \
  python3 -c "
import json
p = '/sandbox/.openclaw/openclaw.json'
with open(p) as f: cfg = json.load(f)
discord = cfg.setdefault('channels', {}).setdefault('discord', {})
discord['execApprovals'] = {
    'enabled': True,
    'target': 'channel',
    'approvers': $APPROVERS_JSON,
}
with open(p, 'w') as f: json.dump(cfg, f, indent=2)
print('  openclaw.json updated')
"

echo "Done. Host approvals defaults (ask/deny fallback) should be set via the"
echo "documented RPC path (openclaw approvals set --gateway) — not in this script."
