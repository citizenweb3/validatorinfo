# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:18-alpine AS builder

RUN apk --no-cache add \
  g++ make python3 git \
  && yarn global add node-gyp \
  && rm -rf /var/cache/apk/*

WORKDIR /builder/

# Cache frontend's package
ADD package.json          .
# ADD yarn.lock             .

# Install dependencies
RUN yarn install --immutable --immutable-cache --check-cache

# Cache frontend's src
ADD --exclude=Dockerfile . .

# Build
ADD prod.env src/.env.production

ENV NODE_OPTIONS="--max-old-space-size=5632"
RUN yarn build --mode production
# ===== Image =====
# ==================
## frontend Image
FROM nginx:alpine AS frontend
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /builder/dist/ /usr/share/nginx/html

COPY --from=builder /builder/src/assets/logos /usr/share/nginx/html/assets
COPY --from=builder /builder/src/assets/icons /usr/share/nginx/html/assets
COPY --from=builder /builder/src/assets/images /usr/share/nginx/html/assets
