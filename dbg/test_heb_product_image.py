#!/usr/bin/env python3
"""Call heb_get_product_image for a known product via MCP.

Confirms the SDK returns image bytes and the MCP tool surfaces them
as an `image` content block. Saves bytes to /tmp for spot-check.
"""
import base64
import json
import sys
import urllib.request

URL = "http://localhost:4321/mcp"
HEADERS_BASE = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
}


def post(body, session_id=None):
    headers = dict(HEADERS_BASE)
    if session_id:
        headers["mcp-session-id"] = session_id
    req = urllib.request.Request(
        URL, data=json.dumps(body).encode(), headers=headers, method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=30)
    raw = resp.read().decode()
    sid = resp.headers.get("mcp-session-id")
    payload = raw
    if "data:" in raw:
        data_lines = [
            line[len("data:") :].strip()
            for line in raw.splitlines()
            if line.startswith("data:")
        ]
        payload = data_lines[-1] if data_lines else raw
    return sid, json.loads(payload)


def main():
    pid = sys.argv[1] if len(sys.argv) > 1 else "931316"

    sid, _ = post(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test_heb_product_image", "version": "0"},
            },
        }
    )
    urllib.request.urlopen(
        urllib.request.Request(
            URL,
            data=json.dumps(
                {"jsonrpc": "2.0", "method": "notifications/initialized"}
            ).encode(),
            headers={**HEADERS_BASE, "mcp-session-id": sid},
            method="POST",
        ),
        timeout=10,
    )

    # Ensure a store is selected; product-detail lookup requires it.
    _, set_store = post(
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "heb_set_store",
                "arguments": {"store_id": "790"},
            },
        },
        session_id=sid,
    )
    if set_store.get("result", {}).get("isError"):
        print("set_store failed:", set_store)

    _, resp = post(
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "heb_get_product_image",
                "arguments": {"product_id": pid, "size": 360},
            },
        },
        session_id=sid,
    )

    content = resp.get("result", {}).get("content", [])
    kinds = [c.get("type") for c in content]
    print("content kinds:", kinds)
    for c in content:
        if c.get("type") == "image":
            data = c["data"]
            raw = base64.b64decode(data)
            out = f"/tmp/heb_product_{pid}.img"
            with open(out, "wb") as f:
                f.write(raw)
            magic = raw[:8].hex()
            print(
                f"image: mimeType={c.get('mimeType')} b64_len={len(data)} "
                f"decoded_bytes={len(raw)} magic={magic} saved={out}"
            )
        elif c.get("type") == "text":
            print("text:", c.get("text"))
    if resp.get("result", {}).get("isError"):
        print("TOOL ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
