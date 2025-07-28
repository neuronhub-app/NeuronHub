export const config = {
  user: {
    username: "admin",
    password: "admin",
  } as const,

  client: {
    port: process.env.E2E_CLIENT_PORT ?? 3001,
    get url() {
      return `http://localhost:${this.port}` as const;
    },
  },
  server: {
    port: process.env.E2E_SERVER_PORT ?? 8001,
    databaseName: process.env.E2E_DB_NAME ?? "test_neuronhub_1",
    get url() {
      return `http://localhost:${this.port}` as const;
    },
    get apiUrl() {
      return `${this.url}/api/graphql`;
    },
  },
} as const;

export type Config = typeof config;
