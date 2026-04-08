#!/bin/bash
set -e

# Resolve the project directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "================================================="
echo "   ResonantOS & IronCurtain Setup Script         "
echo "================================================="
echo "[INFO] Running docker-compose down to clear any existing conflicting networking components..."
docker-compose down || true

echo "[INFO] Cleaning up IronCurtain daemon lockfiles..."
docker run --rm -v ~/.ironcurtain:/root/.ironcurtain alpine rm -f /root/.ironcurtain/escalation-listener.lock || true

echo "[INFO] Building images and booting containers..."
# Use docker-compose to orchestrate both the sandboxed AI and the Ironcurtain listener daemon
docker-compose up -d --build

echo ""
echo "[SUCCESS] The environment has successfully booted!"
echo "IronCurtain is running in Proxy mode across the shared socket, evaluating"
echo "any actions attempted by the sandboxed ResonantOS container."
echo ""
echo "Monitor IronCurtain Logs: docker logs -f ironcurtain_daemon"
echo "Monitor ResonantOS Logs:  docker logs -f resonantos_isolated"
