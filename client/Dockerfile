FROM oven/bun:1-alpine

WORKDIR /app/client

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

# for claude TUI
RUN apk update && apk add --no-cache git fish ripgrep fd bat eza micro

EXPOSE 3000

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
