# syntax=docker/dockerfile:1.4

# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Install sharp for image optimization
RUN apk add --no-cache libc6-compat
RUN yarn add sharp

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Stage 2: Serve the app
FROM node:18-alpine

WORKDIR /app

# Copy build files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["yarn", "start"]
