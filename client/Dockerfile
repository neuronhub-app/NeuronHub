FROM node:24-slim

LABEL org.opencontainers.image.source="https://github.com/neuronhub-app/neuronhub/blob/master/client/Dockerfile"


WORKDIR /app

RUN npm install --global bun
RUN bun add serve

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . ./

EXPOSE 3000

# run `build` in container, as it hardcodes envs as `VITE_SERVER_URL`
CMD ["bash", "-c", "bun run react-router build || true && bunx serve --single build/client --listen tcp://0.0.0.0:3000"]
