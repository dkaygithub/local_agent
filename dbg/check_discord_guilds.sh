#!/usr/bin/env bash
# Check Discord bot guild/server connections via openclaw CLI
set -euo pipefail

echo "=== openclaw channels status --probe ==="
openclaw channels status --probe 2>&1

echo ""
echo "=== openclaw doctor ==="
openclaw doctor 2>&1
