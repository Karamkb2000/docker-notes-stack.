# syntax=docker/dockerfile:1.7

FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN groupadd --system nodejs \
    && useradd --system --gid nodejs --home-dir /app --shell /usr/sbin/nologin appuser
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:nodejs package.json ./
COPY --chown=appuser:nodejs src ./src
USER appuser
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "src/worker.js"]
