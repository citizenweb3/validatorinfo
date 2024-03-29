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
ADD . .

# Build
ADD prod.env .env

RUN cat .env
ENV NODE_OPTIONS="--max-old-space-size=5632"
RUN yarn build --mode production

# ===== Image =====
# ==================
## frontend Image
FROM nginx:alpine AS frontend
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /builder/dist/ /usr/share/nginx/html
