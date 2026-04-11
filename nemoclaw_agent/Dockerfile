FROM node:22-bookworm

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git docker.io socat \
    && rm -rf /var/lib/apt/lists/*

ENV NEMOCLAW_NON_INTERACTIVE=1
ENV PATH="/root/.local/bin:${PATH}"
RUN curl -fsSL https://nvidia.com/nemoclaw.sh | bash -s -- --yes-i-accept-third-party-software || true \
    && nemoclaw --version

COPY entrypoint.sh /entrypoint.sh
COPY fix-policies.sh /fix-policies.sh
RUN chmod +x /entrypoint.sh /fix-policies.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sleep", "infinity"]
