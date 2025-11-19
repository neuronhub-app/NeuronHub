# Build react-router
# ------------------------------------------------

FROM node:24-slim AS builder

ARG VITE_RELEASE_VERSION
ARG VITE_SERVER_URL
ARG NODE_ENV="production"

# Sentry
ARG VITE_RELEASE_NAME
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG=neuronhub
ARG SENTRY_PROJECT=neuronhub-frontend
ARG PROJECT_NAME
ARG SENTRY_DSN_FRONTEND

WORKDIR /app

RUN npm install --global bun

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . ./

RUN apt-get update && apt-get install ca-certificates --yes # for Sentry Source Maps upload

RUN npx react-router build --mode=$NODE_ENV --sourcemapClient


# Nginx
# ------------------------------------------------
FROM nginx:alpine

# after the FROM need to re-declare ARGs:
ARG VITE_RELEASE_VERSION
ARG GITHUB_PATH
ARG NODE_ENV="production"

ENV VITE_RELEASE_VERSION=$VITE_RELEASE_VERSION
ENV NODE_ENV=$NODE_ENV

LABEL org.opencontainers.image.description="Nginx serving React Router static index.html"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/client/Dockerfile"
LABEL org.opencontainers.image.version="$VITE_RELEASE_VERSION"

ENV CLIENT_PORT=3000

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/build/client /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${CLIENT_PORT};
    root /usr/share/nginx/html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

EXPOSE ${CLIENT_PORT}

CMD ["nginx", "-g", "daemon off;"]
