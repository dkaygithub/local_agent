#!/usr/bin/env python3
"""
Test full OpenClaw WebSocket auth challenge flow.
Connects, receives the connect.challenge, responds with the token,
and reads the resulting snapshot/health payload.

Token is read from the openclaw.json config inside the bruiser sandbox.
"""

import socket
import os
import base64
import struct
import json
import time
import subprocess


def get_token():
    result = subprocess.run(
        [
            "openshell", "doctor", "exec", "--",
            "kubectl", "exec", "-n", "openshell", "bruiser", "--",
            "sh", "-c", "cat /sandbox/.openclaw/openclaw.json",
        ],
        capture_output=True, text=True,
    )
    cfg = json.loads(result.stdout.split("\n", 1)[-1])  # skip "Defaulted container" line
    return cfg["gateway"]["auth"]["token"]


def ws_connect(origin="http://localhost:18789", host="localhost", port=18789):
    key = base64.b64encode(os.urandom(16)).decode()
    s = socket.create_connection((host, port), timeout=10)
    hs = (
        "GET / HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        f"Origin: {origin}\r\n"
        "\r\n"
    )
    s.sendall(hs.encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        buf += s.recv(1024)
    print("HTTP:", buf.split(b"\r\n")[0].decode())
    return s


def read_frame(s):
    header = b""
    while len(header) < 2:
        header += s.recv(2 - len(header))
    b0, b1 = header
    opcode = b0 & 0x0F
    masked = (b1 & 0x80) != 0
    length = b1 & 0x7F
    if length == 126:
        ext = b""
        while len(ext) < 2:
            ext += s.recv(2 - len(ext))
        length = struct.unpack("!H", ext)[0]
    elif length == 127:
        ext = b""
        while len(ext) < 8:
            ext += s.recv(8 - len(ext))
        length = struct.unpack("!Q", ext)[0]
    if masked:
        mk = b""
        while len(mk) < 4:
            mk += s.recv(4 - len(mk))
    payload = b""
    while len(payload) < length:
        payload += s.recv(min(4096, length - len(payload)))
    if masked:
        payload = bytes(payload[i] ^ mk[i % 4] for i in range(len(payload)))
    return opcode, payload


def send_frame(s, data: str):
    payload = data.encode()
    mask = os.urandom(4)
    masked = bytes(payload[i] ^ mask[i % 4] for i in range(len(payload)))
    length = len(payload)
    if length < 126:
        header = bytes([0x81, 0x80 | length])
    elif length < 65536:
        header = bytes([0x81, 0xFE]) + struct.pack("!H", length)
    else:
        header = bytes([0x81, 0xFF]) + struct.pack("!Q", length)
    s.sendall(header + mask + masked)


if __name__ == "__main__":
    print("Fetching token from bruiser sandbox...")
    token = get_token()
    print(f"Token: {token[:12]}...{token[-6:]}\n")

    s = ws_connect()
    s.settimeout(5)

    # Step 1: receive challenge
    opcode, payload = read_frame(s)
    msg = json.loads(payload)
    print("← Received:", json.dumps(msg, indent=2))

    if msg.get("event") == "connect.challenge":
        nonce = msg["payload"]["nonce"]
        auth_msg = json.dumps({
            "type": "request",
            "id": "auth-1",
            "method": "connect.auth",
            "params": {"token": token, "nonce": nonce},
        })
        print("\n→ Sending auth response")
        send_frame(s, auth_msg)

        # Step 2: read response frames
        deadline = time.time() + 5
        while time.time() < deadline:
            try:
                opcode, payload = read_frame(s)
                msg = json.loads(payload)
                print("\n← Received:", json.dumps(msg)[:600])
            except socket.timeout:
                print("\n(no more frames)")
                break

    s.close()
