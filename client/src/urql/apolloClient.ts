import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { env } from "@/env";

export const apolloClient = createClientV2();

function createClientV2() {
  const backendUrl = `${env.VITE_SERVER_URL}/api/graphql`;

  // show local warnings
  if (import.meta.env.NODE_ENV === "development") {
    loadDevMessages();
    loadErrorMessages();
  }

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    devtools: {
      enabled: import.meta.env.NODE_ENV === "development",
    },
    link: ApolloLink.from([
      new HttpLink({
        uri: backendUrl,
        credentials: "include",
        // @ts-expect-error
        fetch: fetchUsingReadableUrl,
      }),
    ]),
  });
  return client;
}

/**
 * Change `/api/graphql/` -> `/api/graphql/QueryName?variables=...`
 */
function fetchUsingReadableUrl(uri: RequestInfo | Request | URL, options?: RequestInit) {
  const bodyString = typeof options?.body === "string" ? options.body : "";
  const body = JSON.parse(bodyString);

  let urlReadable = uri;
  if (body.operationName) {
    urlReadable += `/${body.operationName}`;

    if (Object.keys(body.variables ?? {}).length) {
      const variablesSerialized = structuredClone(body.variables);
      for (const [varKey, varValue] of Object.entries(variablesSerialized)) {
        // a large GraphQL variable can exceed the browser param limit & it'll throw a CORS error
        const queryParamSoftLimit = 20;
        if (String(varValue).length > queryParamSoftLimit) {
          variablesSerialized[varKey] = `${String(varValue).slice(0, queryParamSoftLimit)}...`;
        }
      }
      const searchParams = new URLSearchParams(variablesSerialized);
      urlReadable += `?${searchParams.toString()}`;
    }
  }
  return fetch(urlReadable, options);
}
