#!/usr/bin/env python3
"""
Fix inference model ID in openclaw.json to use the models/ prefix
required by Google's Gemini API.

Run via: kubectl exec -n openshell bruiser -- python3 /tmp/fix_model_id.py
"""

import json

path = "/sandbox/.openclaw/openclaw.json"
with open(path) as f:
    cfg = json.load(f)

providers = cfg.get("models", {}).get("providers", {})
inference = providers.get("inference", {})
models = inference.get("models", [])

changed = []
for m in models:
    if not m["id"].startswith("models/"):
        old_id = m["id"]
        m["id"] = "models/" + m["id"]
        m["name"] = "inference/" + m["id"]
        changed.append((old_id, m["id"]))

# Also fix agents default model
agent_model = cfg.get("agents", {}).get("defaults", {}).get("model", {})
for key in ("primary", "secondary"):
    val = agent_model.get(key, "")
    if val.startswith("inference/") and not val.startswith("inference/models/"):
        model_part = val[len("inference/"):]
        agent_model[key] = "inference/models/" + model_part
        changed.append((val, agent_model[key]))

with open(path, "w") as f:
    json.dump(cfg, f, indent=2)

print("Fixed model IDs:")
for old, new in changed:
    print(f"  {old} -> {new}")
