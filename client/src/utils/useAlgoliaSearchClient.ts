import { type LiteClient, liteClient } from "algoliasearch/lite";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { useStateValtio } from "@/utils/useValtioProxyRef";

export function useAlgoliaSearchClient() {
  const state = useStateValtio({
    client: null as null | LiteClient,
    indexName: undefined as undefined | string,
  });

  const init = useInit({
    isReady: true,
    onInit: async () => {
      const res = await client.query({ query: AlgoliaSearchKeyQuery });
      if (res.error || !res.data?.algolia_search_key) {
        return toast.error(res.error?.message);
      }
      const { app_id, api_key, index_name } = res.data.algolia_search_key;
      state.mutable.client = liteClient(app_id, api_key);
      state.mutable.indexName = index_name;
    },
  });

  return {
    client: state.snap.client,
    indexName: state.snap.indexName,
    loading: init.isLoading,
  };
}

const AlgoliaSearchKeyQuery = graphql.persisted(
  "AlgoliaSearchKey",
  graphql(`
    query AlgoliaSearchKey {
      algolia_search_key {
        api_key
        app_id
        index_name
      }
    }
  `),
);
