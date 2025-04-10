import { makeUrlsReadableExchange } from "@/urql/makeUrlsReadableExchange";
import { refetchQueriesExchange } from "@/urql/refetchQueriesExchange";
import { Client, cacheExchange, fetchExchange } from "urql";

export const urqlClient = new Client({
  url: "http://localhost:8000/api/graphql",
  exchanges: [makeUrlsReadableExchange, cacheExchange, refetchQueriesExchange, fetchExchange],
  fetchOptions: {
    credentials: "include", // it isn't in TS type, and they say to use headers.credentials, but that's wrong.
    mode: "cors",
  },
});
