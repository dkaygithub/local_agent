FROM node:22-bookworm

# Install dependencies for Ollama and IronCurtain
RUN apt-get update && apt-get install -y \
    curl \
    zstd \
    bubblewrap \
    socat \
    git \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Install IronCurtain globally
RUN npm install -g @provos/ironcurtain

# Setup the runtime directory
COPY start.sh .
RUN chmod +x start.sh

ENTRYPOINT ["/app/start.sh"]
