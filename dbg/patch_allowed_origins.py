#!/usr/bin/env python3
"""
Patch gateway.controlUi.allowedOrigins in openclaw.json inside the bruiser sandbox
to include both http://127.0.0.1:18789 and http://localhost:18789.

Run via: openshell sandbox exec -n bruiser -- python3 /dbg/patch_allowed_origins.py
(note: `nemoclaw ... connect --command "..."` hangs — do not use it.)
"""

import json

path = "/sandbox/.openclaw/openclaw.json"
with open(path) as f:
    cfg = json.load(f)

cfg["gateway"]["controlUi"]["allowedOrigins"] = [
    "http://127.0.0.1:18789",
    "http://localhost:18789",
]

with open(path, "w") as f:
    json.dump(cfg, f, indent=2)

print("Updated allowedOrigins:", cfg["gateway"]["controlUi"]["allowedOrigins"])
