import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { env } from "@/env";

export const client = createApolloClient();

function createApolloClient() {
  // real error reports, not the useless: `An error occurred [...] full error text at https://go.apollo.dev/c/err#{hash}`
  loadErrorMessages();

  if (env.isDev) {
    loadDevMessages();
  }

  const client = new ApolloClient({
    cache: new InMemoryCache({
      // Fix for nested fragment spreading when gql.tada disableMasking is true
      // Apollo needs explicit possibleTypes for interfaces to properly handle fragments (see #40)
      possibleTypes: {
        PostTypeI: ["PostType", "PostToolType", "PostReviewType", "PostCommentType"],
      },
    }),
    devtools: {
      enabled: env.isDev,
    },
    link: ApolloLink.from([
      new HttpLink({
        uri: env.VITE_SERVER_URL_API,
        credentials: "include",
        // @ts-expect-error
        fetch: fetchUsingReadableUrl,
      }),
    ]),
  });
  return client;
}

// Change:
// - `/api/graphql/` -> `/api/graphql/Name`
// - `/api/graphql/` -> `/api/graphql/mutate/Name`
function fetchUsingReadableUrl(uri: RequestInfo | Request | URL, options?: RequestInit) {
  const bodyString = typeof options?.body === "string" ? options.body : "";
  const body = JSON.parse(bodyString);

  let urlModified = uri;
  if (body.operationName) {
    const isMutation = body.query.startsWith("mutation");
    if (isMutation) {
      urlModified += `/mutate`;
    }
    urlModified += `/${body.operationName}`;

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
      urlModified += `?${searchParams.toString()}`;
    }
  }
  return fetch(urlModified, options);
}
