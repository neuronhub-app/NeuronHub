FROM oven/bun:latest

WORKDIR /app/client

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
