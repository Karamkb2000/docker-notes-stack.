# syntax=docker/dockerfile:1.7

FROM node:20-bookworm AS build
WORKDIR /app
COPY package.json ./
COPY build.js ./
COPY public ./public
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost/ || exit 1
