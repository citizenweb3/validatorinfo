# ==============================================
# Stage 1: Dependencies - install all dependencies once
# Using Debian for compatibility with native modules
# ==============================================
FROM node:20 AS deps

WORKDIR /app

# Copy only dependency files for better caching
COPY package.json yarn.lock ./

# Install dependencies with retry and increased timeout
# --frozen-lockfile - don't update yarn.lock (deterministic build)
# --network-timeout - increased timeout for problematic networks
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy Prisma schemas and generate clients
COPY prisma ./prisma
RUN npx prisma generate && \
    npx prisma generate --schema=prisma/events/schema.prisma

# ==============================================
# Stage 2: Base - base image with code and Prisma clients
# ==============================================
FROM node:20-alpine AS base

# Install redis-cli and other necessary tools
# openssl - for Prisma
# libc6-compat - for compatibility with some Node.js modules
RUN apk add --no-cache redis openssl libc6-compat

WORKDIR /app

# Copy node_modules from deps stage (including Prisma clients)
COPY --from=deps /app/node_modules ./node_modules

# Copy entire project code
COPY . .

# ==============================================
# Stage 3: Builder - build Next.js application
# ==============================================
FROM base AS builder

WORKDIR /app

# Accept DATABASE_URL as build arguments
# Required for Next.js build, since API routes initialize Prisma
ARG DATABASE_URL
ARG EVENTS_DATABASE_URL

# Set as environment variables for build process
ENV DATABASE_URL=${DATABASE_URL}
ENV EVENTS_DATABASE_URL=${EVENTS_DATABASE_URL}

# Build Next.js application
RUN yarn build

# ==============================================
# Stage 4: Migrations - image for database migrations
# ==============================================
FROM base AS migrations

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Command will be overridden in docker-compose.yml
CMD ["echo", "Migrations service ready"]

# ==============================================
# Stage 5: Frontend - production image for Next.js
# ==============================================
FROM base AS frontend

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Start production server
CMD ["yarn", "start"]

# ==============================================
# Stage 6: Indexer - image for background jobs
# ==============================================
FROM base AS indexer

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3001

# Start indexer (flushall moved to init-chains)
CMD ["npx", "tsx", "server/indexer.ts"]
