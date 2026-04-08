#!/bin/bash
set -e

echo "[+] Starting local Ollama server..."
# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

echo "[+] Waiting for Ollama to boot..."
sleep 5

echo "[+] Booting OpenClaw gateway connected to the IronCurtain MCP Proxy..."
# Note: Because the container is completely isolated, all file operations OpenClaw
# executes will inherently be tracked if openclaw leverages MCP via IronCurtain
openclaw gateway run &

# Wait for the gateway to start listening before booting the dashboard
echo "[+] Waiting for gateway to initialize..."
for i in $(seq 1 30); do
    if [ -f /root/.openclaw/openclaw.json ]; then
        if curl -s --max-time 1 http://127.0.0.1:18789 >/dev/null 2>&1 || \
           [ "$(cat /proc/net/tcp 2>/dev/null | grep -c ':495D')" -gt 0 ]; then
            echo "[+] Gateway is ready."
            break
        fi
    fi
    sleep 1
done

echo "[+] Booting ResonantOS Dashboard..."
cd /root/resonantos-alpha/dashboard
./venv/bin/python server_v2.py
