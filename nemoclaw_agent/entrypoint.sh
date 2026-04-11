#!/bin/bash
set -e

# Auto-connect the sandbox port forward on startup.
# NEMOCLAW_SANDBOX is set in docker-compose.yml to the name from onboarding.
if [ -n "${NEMOCLAW_SANDBOX}" ]; then
  echo ""
  echo "  Sandbox: ${NEMOCLAW_SANDBOX}"
  echo "  Port forward will start on 0.0.0.0:18789 → http://localhost:18789"
  echo ""
fi

# Network policies are managed persistently via ~/.nemoclaw/sandboxes.json
# and the OpenShell cluster's openshell-data persistent volume.
# No dynamic application required.

# CMD becomes the main process (see docker-compose.yml).
exec "$@"
