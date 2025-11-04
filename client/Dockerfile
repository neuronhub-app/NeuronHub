# Build react-router
FROM node:24-slim AS builder

ARG VITE_RELEASE_NAME
ARG VITE_SERVER_URL
ARG SENTRY_AUTH_TOKEN
ARG NODE_ENV="production"

WORKDIR /app

RUN npm install --global bun

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . ./

RUN apt-get update && apt-get install ca-certificates --yes # for Sentry Source Maps upload


RUN npx react-router build

# Setup nginx

FROM nginx:alpine

LABEL org.opencontainers.image.source="https://github.com/neuronhub-app/neuronhub/blob/master/client/Dockerfile"
LABEL org.opencontainers.image.description="Nginx serving React Router static index.html"

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
