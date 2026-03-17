# #AI
# ------------------------------------------------

# Build react-router (SSR)
# ------------------------------------------------

FROM node:24-slim AS builder

ARG VITE_RELEASE_VERSION
ARG VITE_SERVER_URL
ARG VITE_CLIENT_URL
ARG NODE_ENV="production"

WORKDIR /app

RUN npm install --global bun

# Bun workspace: root config + lockfile, then each workspace's package.json #124
COPY package.json bun.lock ./
COPY docs/package.json ./docs/
COPY packages/shared/package.json ./packages/shared/
COPY client/package.json ./client/

RUN bun install --frozen-lockfile

COPY docs/ ./docs/
COPY packages/shared/ ./packages/shared/

ENV PATH="/app/docs/node_modules/.bin:$PATH"
WORKDIR /app/docs

RUN react-router build


# Serve (SSR needs Node.js)
# ------------------------------------------------

FROM node:24-slim

ARG VITE_RELEASE_VERSION
ARG GITHUB_PATH

LABEL org.opencontainers.image.description="React Router SSR docs site"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/docs/Dockerfile"
LABEL org.opencontainers.image.version="$VITE_RELEASE_VERSION"

ENV DOCS_PORT=3000

WORKDIR /app

COPY --from=builder /app/docs/build ./build
COPY --from=builder /app/docs/package.json ./

# #AI-slop
# Strip workspace:* dep (bundled by Vite at build time), then install runtime deps
RUN node -e "const p=require('./package.json'); delete p.dependencies['@neuronhub/shared']; delete p.devDependencies; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" \
    && npm install --omit=dev

EXPOSE ${DOCS_PORT}

CMD ["node", "node_modules/@react-router/serve/bin.js", "./build/server/index.js"]
