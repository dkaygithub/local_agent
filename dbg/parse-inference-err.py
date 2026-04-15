import json, sys, re

raw = sys.stdin.read()
m = re.search(r"^request-body[^:]*:\s*(.*?)\nresponse-body", raw, re.S | re.M)
body = m.group(1).strip()
if body.startswith("["):
    body = body[1:-1]
req = json.loads(body)
msgs = req.get("messages", [])
tcs = [tc for msg in msgs if msg.get("role") == "assistant" for tc in (msg.get("tool_calls") or [])]
with_sig = sum(1 for tc in tcs if tc.get("function", {}).get("thought_signature"))
with_rd = sum(1 for msg in msgs if msg.get("role") == "assistant" and msg.get("reasoning_details"))
print(f"msgs={len(msgs)} tool_calls={len(tcs)} with_sig={with_sig} with_reasoning_details={with_rd}")
if tcs:
    print("tc keys:", list(tcs[0].keys()))
    print("function keys:", list((tcs[0].get("function") or {}).keys()))
    print("first tc function:", json.dumps(tcs[0].get("function"))[:300])
