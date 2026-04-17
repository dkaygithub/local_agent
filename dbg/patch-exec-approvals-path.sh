#!/usr/bin/env bash
# Patch openclaw's hardcoded exec-approvals path inside the bruiser sandbox
# from ~/.openclaw/exec-approvals.json (a symlink openclaw refuses to write
# through) to ~/.openclaw-data/exec-approvals.json (a regular file).
#
# Without this, every tool exec fails with:
#   [tools] exec failed: Refusing to write exec approvals via symlink:
#                        /sandbox/.openclaw/exec-approvals.json
#
# Upstream tracking:
#   Issue: https://github.com/NVIDIA/NemoClaw/issues/1785
#   PR:    https://github.com/NVIDIA/NemoClaw/pull/1823  (fix in flight)
#
# When PR 1823 merges and the bruiser sandbox image is rebuilt with it, this
# patch becomes unnecessary — delete this script and drop AGENTS.md §16.
#
# Idempotent: scans all openclaw dist *.js bundles, rewrites any occurrence
# of the legacy path to the data path, verifies no legacy references remain,
# fails loud if the dist directory is missing. Safe to re-run; does nothing
# when the dist is already patched (newer openclaw release, or prior run).
#
# Must run as root (paths under /usr/local/lib/node_modules/openclaw/dist are
# not writable by uid 998). Uses `openshell doctor exec -- kubectl exec` for
# the same reason `dbg/patch-pi-ai.sh` does.

set -euo pipefail

SANDBOX="${SANDBOX:-bruiser}"

openshell doctor exec -- kubectl exec -n openshell "$SANDBOX" -- bash -c '
set -euo pipefail
DIST="/usr/local/lib/node_modules/openclaw/dist"
LEGACY="~/.openclaw/exec-approvals.json"
DATA="~/.openclaw-data/exec-approvals.json"

if [ ! -d "$DIST" ]; then
  echo "Error: openclaw dist directory not found: $DIST" >&2
  exit 1
fi

files="$(grep -R --include="*.js" -l "$LEGACY" "$DIST" || true)"
if [ -z "$files" ]; then
  if grep -R --include="*.js" -q "$DATA" "$DIST"; then
    echo "  already patched (or upstream fix landed) — no-op"
    exit 0
  fi
  echo "Error: could not locate the exec-approvals path reference in $DIST" >&2
  exit 1
fi

echo "$files" | while IFS= read -r f; do
  sed -i "s#${LEGACY}#${DATA}#g" "$f"
  echo "  patched: $f"
done

if grep -R --include="*.js" -q "$LEGACY" "$DIST"; then
  echo "Error: legacy path still present after patch" >&2
  exit 1
fi
echo "  verified: no legacy path references remain"
'
