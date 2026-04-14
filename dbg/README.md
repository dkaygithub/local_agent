# /dbg — Debug & Diagnostic Scripts

Scripts written during debugging sessions. Each file is named for what it does.

| File | Purpose |
|---|---|
| `test_ws_origin.py` | Test WebSocket handshake with different Origin headers |
| `read_ws_frames.py` | Connect to OpenClaw WS and read raw frames (reveals connect.challenge) |
| `patch_allowed_origins.py` | Patch openclaw.json inside bruiser to add localhost to allowedOrigins |
