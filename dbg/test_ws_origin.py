#!/usr/bin/env python3
"""
Test WebSocket handshake against the OpenClaw gateway (port 18789)
with different Origin headers to diagnose the "health offline" banner.
"""

import socket
import os
import base64


def test_ws(origin, host="localhost", port=18789):
    key = base64.b64encode(os.urandom(16)).decode()
    s = socket.create_connection((host, port))
    handshake = (
        "GET / HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        f"Origin: {origin}\r\n"
        "\r\n"
    )
    s.sendall(handshake.encode())
    resp = s.recv(4096).decode(errors="replace")
    s.close()
    return resp.split("\r\n")[0]


if __name__ == "__main__":
    cases = [
        "http://localhost:18789",
        "http://127.0.0.1:18789",
        "http://localhost",
        "",
    ]
    for origin in cases:
        label = repr(origin) if origin else "(no Origin header)"
        result = test_ws(origin)
        print(f"Origin {label:35s} → {result}")
