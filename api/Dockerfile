# syntax=docker/dockerfile:1.7

FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN groupadd --system nodejs \
    && useradd --system --gid nodejs --home-dir /app --shell /usr/sbin/nologin appuser
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:nodejs package.json ./
COPY --chown=appuser:nodejs src ./src
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:3000/health || exit 1
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "src/server.js"]
