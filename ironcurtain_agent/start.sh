#!/bin/bash
set -e

echo "Starting Ollama daemon..."
# Start Ollama in the background
OLLAMA_HOST=127.0.0.1 ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to become available..."
until curl -s http://127.0.0.1:11434/api/tags >/dev/null; do
    sleep 2
done
echo "Ollama API is ready."

echo "Pulling llama3.1 model if not present..."
ollama pull llama3.1

echo "Starting Iron Curtain daemon..."
# Since ironcurtain is linked, we can run it globally
# It will load its config from ~/.ironcurtain/config.json which we'll mount
ironcurtain daemon

# If the daemon exits, shut down ollama
kill $OLLAMA_PID
