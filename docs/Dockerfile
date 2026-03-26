# #AI
# ================================================

# Build react-router (SSR)
# ------------------------------------------------

FROM node:24-slim AS builder

ARG VITE_RELEASE_VERSION
ARG VITE_SITE
ARG VITE_SERVER_URL
ARG VITE_CLIENT_URL
ARG NODE_ENV="production"

ARG VITE_ALGOLIA_APPLICATION_ID
ARG VITE_ALGOLIA_SEARCH_API_KEY
ARG VITE_ALGOLIA_INDEX_DOCS

ARG DEPLOY_DIR=/deploy

WORKDIR /app

RUN corepack enable pnpm

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY docs/package.json ./docs/
COPY packages/shared/package.json ./packages/shared/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile

COPY docs/ ./docs/
COPY packages/shared/ ./packages/shared/

WORKDIR /app/docs

RUN pnpm exec react-router build

RUN pnpm deploy --filter=neuronhub-docs --prod $DEPLOY_DIR


# Serve (SSR needs Node.js)
# ------------------------------------------------

FROM node:24-slim

ARG VITE_RELEASE_VERSION
ARG GITHUB_PATH
ARG DEPLOY_DIR=/deploy

LABEL org.opencontainers.image.description="React Router SSR docs site"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/docs/Dockerfile"
LABEL org.opencontainers.image.version="$VITE_RELEASE_VERSION"

ENV DOCS_PORT=3000

WORKDIR /app

COPY --from=builder $DEPLOY_DIR ./

EXPOSE ${DOCS_PORT}

CMD ["node", "node_modules/@react-router/serve/bin.js", "./build/server/index.js"]
