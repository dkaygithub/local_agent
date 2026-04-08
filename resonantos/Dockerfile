FROM nvidia/cuda:12.2.0-base-ubuntu22.04

# Ensure no apt-get prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Git, Curl, Python3, and Pip
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
    zstd \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.x (OpenClaw requires Node >= 22.12)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama CLI so it can leverage the GPU locally
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /root

# Use local codebase (fix/gateway-token-route branch)
COPY resonantos-alpha /root/resonantos-alpha

# Bake the LLM Models directly into the image by booting Ollama temporarily
ENV OLLAMA_HOST=127.0.0.1:11434
RUN ollama serve & sleep 5 \
    && ollama pull nomic-embed-text \
    && ollama pull llama3.1 \
    && pkill ollama

WORKDIR /root/resonantos-alpha

# Install OpenClaw, which ResonantOS relies on as a kernel
RUN npm install -g openclaw@latest

# Set up dashboard Python venv and deps (install.js tries to re-clone, so we run deps directly)
RUN cd dashboard && \
    python3 -m venv venv && \
    venv/bin/pip install -q flask flask-cors psutil websocket-client solana solders

# Copy the start script we composed
ARG CACHE_BUST=1
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Pre-seed OpenClaw config with Ollama provider
RUN mkdir -p /root/.openclaw
COPY openclaw.json /root/.openclaw/openclaw.json

ENTRYPOINT ["/start.sh"]
