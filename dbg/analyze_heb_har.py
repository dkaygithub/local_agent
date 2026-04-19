#!/usr/bin/env python3
"""Summarize a HEB HAR: list every POST/PUT/PATCH/DELETE to HEB hosts,
with URL, operationName (if GraphQL), request body shape, and response status.
Skip static/image/asset noise.
"""
import json
import sys
from urllib.parse import urlparse

if len(sys.argv) < 2:
    sys.exit("usage: analyze_heb_har.py <path-to-har>")
HAR_PATH = sys.argv[1]

HEB_HOST_SUBSTR = ("heb.com", "hebdigital", "heb-ecom-api")
SKIP_EXT = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
            ".css", ".woff", ".woff2", ".ttf", ".js", ".mp4", ".map")


def short(s, n=200):
    if s is None:
        return None
    if len(s) <= n:
        return s
    return s[:n] + f"...<{len(s)-n} more>"


def main():
    with open(HAR_PATH) as f:
        har = json.load(f)
    entries = har["log"]["entries"]
    interesting = []
    for e in entries:
        req = e["request"]
        res = e["response"]
        url = req["url"]
        parsed = urlparse(url)
        if not any(h in parsed.netloc for h in HEB_HOST_SUBSTR):
            continue
        if parsed.path.lower().endswith(SKIP_EXT):
            continue
        method = req["method"]
        # Only mutating requests, plus GETs to /graphql just in case
        if method == "GET" and "graphql" not in parsed.path:
            continue
        post_text = None
        op_name = None
        try:
            post_text = req.get("postData", {}).get("text")
            if post_text and ("operationName" in post_text or "query" in post_text or "mutation" in post_text):
                j = json.loads(post_text)
                if isinstance(j, list):
                    op_name = ",".join(str(x.get("operationName")) for x in j)
                    post_text = short(json.dumps(j), 400)
                else:
                    op_name = j.get("operationName")
                    post_text = short(json.dumps(j), 400)
            else:
                post_text = short(post_text, 400)
        except Exception:
            post_text = short(post_text, 400)
        interesting.append({
            "method": method,
            "host": parsed.netloc,
            "path": parsed.path,
            "op": op_name,
            "status": res["status"],
            "resType": res.get("content", {}).get("mimeType"),
            "body": post_text,
            "respSize": res.get("content", {}).get("size"),
        })
    print(f"total HEB mutating/graphql entries: {len(interesting)}")
    print("-" * 80)
    seen_ops = {}
    for i, row in enumerate(interesting):
        tag = row["op"] or row["path"]
        seen_ops.setdefault(tag, 0)
        seen_ops[tag] += 1
        print(f"[{i:3d}] {row['method']:5s} {row['status']} {row['host']}{row['path']}")
        if row["op"]:
            print(f"       op: {row['op']}")
        if row["body"]:
            print(f"       body: {row['body']}")
        print()
    print("=" * 80)
    print("operation/path counts:")
    for op, ct in sorted(seen_ops.items(), key=lambda x: -x[1]):
        print(f"  {ct:3d}  {op}")


if __name__ == "__main__":
    main()
