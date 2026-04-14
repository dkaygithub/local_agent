#!/usr/bin/env python3
"""
Connect to OpenClaw WebSocket gateway and read the first few frames
to see what the server sends (snapshot, auth challenge, error, etc.)
"""

import socket
import os
import base64
import struct
import time


def ws_connect(origin="http://localhost:18789", host="localhost", port=18789):
    key = base64.b64encode(os.urandom(16)).decode()
    s = socket.create_connection((host, port), timeout=5)
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
    # Read HTTP response
    buf = b""
    while b"\r\n\r\n" not in buf:
        buf += s.recv(1024)
    status = buf.split(b"\r\n")[0].decode()
    print(f"Handshake: {status}")
    return s


def read_frame(s):
    """Read one WebSocket frame, return (opcode, payload_bytes)."""
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
    mask_key = b""
    if masked:
        while len(mask_key) < 4:
            mask_key += s.recv(4 - len(mask_key))
    payload = b""
    while len(payload) < length:
        chunk = s.recv(min(4096, length - len(payload)))
        if not chunk:
            break
        payload += chunk
    if masked:
        payload = bytes(payload[i] ^ mask_key[i % 4] for i in range(len(payload)))
    return opcode, payload


if __name__ == "__main__":
    s = ws_connect()
    s.settimeout(3)
    print("Reading frames for 5 seconds...\n")
    deadline = time.time() + 5
    while time.time() < deadline:
        try:
            opcode, payload = read_frame(s)
            names = {1: "TEXT", 2: "BINARY", 8: "CLOSE", 9: "PING", 10: "PONG"}
            name = names.get(opcode, f"OP{opcode}")
            print(f"[{name}] {payload[:500]}")
        except socket.timeout:
            print("(timeout — no more frames)")
            break
        except Exception as e:
            print(f"Error: {e}")
            break
    s.close()
