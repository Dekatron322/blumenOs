# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS base
WORKDIR /app

# Install build tools and dependencies once
FROM base AS deps
ENV NODE_ENV=development
RUN set -eux; \
  export DEBIAN_FRONTEND=noninteractive; \
  apt-get update; \
  apt-get install -y --no-install-recommends build-essential python3 ca-certificates; \
  rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the Next.js app
FROM base AS builder
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production runtime image (using standalone output)
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Use the non-root node user provided by the base image
USER node

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]