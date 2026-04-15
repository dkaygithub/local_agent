"""Parse /tmp/inference-all.log (piped on stdin) and summarize:
- for each request, how many outgoing tool_calls carry
  extra_content.google.thought_signature vs not
- response status and first 400 chars if an error payload

Usage:
  openshell doctor exec -- kubectl exec -n openshell bruiser -- cat /tmp/inference-all.log \\
    | python3 dbg/analyze-inference-log.py
"""
import json
import re
import sys

raw = sys.stdin.read()
# Drop kubectl "Defaulted container" header line(s).
raw = "\n".join(l for l in raw.split("\n") if not l.startswith("Defaulted"))
records = re.split(r"^--- ", raw, flags=re.M)
print(f"records: {len(records) - 1}")
for i, rec in enumerate(records[1:], start=1):
    status_m = re.search(r"status=(\d+)", rec)
    req_m = re.search(r"request-body \((\d+) chars\): (.*?)\nresponse-body", rec, re.S)
    resp_m = re.search(r"response-body \((\d+) chars\): (.*)", rec, re.S)
    print(f"\n=== record {i} status={status_m.group(1) if status_m else '?'} "
          f"req_chars={req_m.group(1) if req_m else '?'} "
          f"resp_chars={resp_m.group(1) if resp_m else '?'}")
    if req_m:
        try:
            req = json.loads(req_m.group(2))
            msgs = req.get("messages", [])
            tcs = [
                tc
                for m in msgs
                if m.get("role") == "assistant"
                for tc in (m.get("tool_calls") or [])
            ]
            with_sig = sum(
                1
                for tc in tcs
                if (tc.get("extra_content") or {}).get("google", {}).get("thought_signature")
            )
            print(f"  msgs={len(msgs)} tool_calls={len(tcs)} with_sig={with_sig}")
            if tcs:
                first = tcs[0]
                print(f"  first tc keys: {sorted(first.keys())}")
                print(f"  first tc extra_content: "
                      f"{json.dumps(first.get('extra_content'))[:200]}")
        except Exception as exc:
            print(f"  req parse err: {exc}")
    if resp_m:
        resp = resp_m.group(2)
        if "error" in resp[:500].lower() or (status_m and int(status_m.group(1)) >= 400):
            print(f"  resp[:400]: {resp[:400]}")
