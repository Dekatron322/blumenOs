# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS base
ENV NODE_ENV=production
WORKDIR /app

FROM base AS deps
RUN set -eux; \
  export DEBIAN_FRONTEND=noninteractive; \
  for i in 1 2 3; do \
    apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 ca-certificates && \
    break; \
    echo "apt-get failed, retrying ($i/3)..." >&2; \
    sleep 5; \
  done; \
  rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS builder
ENV NODE_ENV=production
# COPY the node_modules from deps stage FIRST
COPY --from=deps /app/node_modules ./node_modules
# Then copy the rest of the application
COPY . .
RUN yarn build

FROM base AS prod-deps
RUN set -eux; \
  export DEBIAN_FRONTEND=noninteractive; \
  for i in 1 2 3; do \
    apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 ca-certificates && \
    break; \
    echo "apt-get failed, retrying ($i/3)..." >&2; \
    sleep 5; \
  done; \
  rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
RUN addgroup --system --gid 1001 nextjs \
  && adduser --system --uid 1001 nextjs
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/env.mjs ./env.mjs

USER nextjs
CMD ["yarn", "start"]