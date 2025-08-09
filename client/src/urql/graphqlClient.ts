import { captureException } from "@sentry/react";
import { parse } from "graphql";
import type { OperationDefinitionNode } from "graphql/language/ast";
import { GraphQLClient } from "graphql-request";
import { env } from "@/env";

export const graphqlClient = new GraphQLClient(`${env.VITE_SERVER_URL}/api/graphql`, {
  credentials: "include",
  mode: "cors",
  fetch: fetchWithReadableGraphqlUrl,
});

/**
 * Changes the urls from:
 * - /api/graphql/
 * To:
 * - /api/graphql/?query={query_name}
 * - /api/graphql/?mutation={mutation_name}
 */
function fetchWithReadableGraphqlUrl(url: URL | RequestInfo, options?: RequestInit) {
  let urlNew = url;
  try {
    const body = JSON.parse(options?.body as string);
    const definition = parse(body.query).definitions[0] as OperationDefinitionNode;
    const urlObj = new URL(url as URL);
    urlObj.searchParams.set(definition.operation, String(definition.name?.value));
    urlNew = urlObj.toString();
  } catch (error) {
    captureException(error);
  }

  return fetch(urlNew, options);
}

// for typing on Bun
fetchWithReadableGraphqlUrl.preconnect = fetch.preconnect;
