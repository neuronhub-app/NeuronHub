import { Client, cacheExchange, fetchExchange } from "urql";
import { env } from "@/env";
import { makeUrlsReadableExchange } from "@/urql/makeUrlsReadableExchange";
import { refetchQueriesExchange } from "@/urql/refetchQueriesExchange";

export const urqlClient = new Client({
  url: `${env.VITE_SERVER_URL}/api/graphql`,
  exchanges: [makeUrlsReadableExchange, cacheExchange, refetchQueriesExchange, fetchExchange],
  fetchOptions: {
    credentials: "include", // it isn't in TS type, and they say to use headers.credentials, but that's wrong.
    mode: "cors",
  },
});
