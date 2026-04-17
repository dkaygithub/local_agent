FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Overlay local SDK build (adds checkout methods not yet in npm release)
COPY vendor/heb-sdk-dist/ ./node_modules/heb-sdk-unofficial/dist/

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

RUN npm prune --omit=dev

ENV HEB_TOKEN_FILE=/secrets/tokens.json
ENV PORT=4321
ENV HOST=0.0.0.0

EXPOSE 4321
CMD ["node", "dist/src/server.js"]
