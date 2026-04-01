import {
  type LegacySearchMethodProps,
  type LiteClient,
  type SearchMethodParams,
  type SearchParamsObject,
  liteClient,
} from "algoliasearch/lite";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

const algoliaIndexNames = {
  indexName: undefined as undefined | string,
  indexNameSortedByVotes: undefined as undefined | string,
  indexNameProfiles: undefined as undefined | string,
  indexNameJobs: undefined as undefined | string,
  indexNameJobsSortedByClosesAt: undefined as undefined | string,
};

export type AlgoliaIndexKey = keyof typeof algoliaIndexNames;

export function useAlgoliaSearchClient() {
  const state = useStateValtio({
    client: null as null | LiteClient,
    ...algoliaIndexNames,
  });

  const init = useInit({
    isReady: true,
    onInit: async () => {
      const res = await client.query({ query: AlgoliaSearchKeyQuery });
      if (res.error || !res.data?.algolia_search_key) {
        return toast.error(res.error?.message);
      }
      const data = res.data.algolia_search_key;
      state.mutable.client = wrapClientWithLocationInterceptor(
        liteClient(data.app_id, data.api_key),
      );
      state.mutable.indexName = data.index_name;
      state.mutable.indexNameSortedByVotes = data.index_name_sorted_by_votes;
      state.mutable.indexNameProfiles = data.index_name_profiles;
      state.mutable.indexNameJobs = data.index_name_jobs;
      state.mutable.indexNameJobsSortedByClosesAt = data.index_name_jobs_sorted_by_closes_at;
    },
  });

  return {
    client: state.snap.client,
    indexName: state.snap.indexName,
    indexNameSortedByVotes: state.snap.indexNameSortedByVotes,
    indexNameProfiles: state.snap.indexNameProfiles,
    indexNameJobs: state.snap.indexNameJobs,
    indexNameJobsSortedByClosesAt: state.snap.indexNameJobsSortedByClosesAt,
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
        index_name_sorted_by_votes
        index_name_profiles
        index_name_jobs
        index_name_jobs_sorted_by_closes_at
      }
    }
  `),
);

/**
 * #quality-21% #AI-slop
 *
 * Cross-facet OR for locations (country/city/remote).
 *
 * instantsearch treats each `operator:"or"` facet independently — disjunctive
 * queries for one location attr still carry filters from other location attrs.
 * We intercept the batch to:
 *   - main query with 2+ location groups → merge into single OR group
 *   - disjunctive query for a location attr → strip all location filters
 */

function wrapClientWithLocationInterceptor(algoliaClient: LiteClient): LiteClient {
  return {
    ...algoliaClient,
    search: (params, requestOptions) =>
      algoliaClient.search(rewriteSearchParams(params), requestOptions),
    searchForFacets: (params, requestOptions) =>
      algoliaClient.searchForFacets(rewriteSearchParams(params), requestOptions),
  } as LiteClient;
}

export const location_fields = {
  name: "locations.name",
  remote: "locations.remote_name",
  country: "locations.country",
  city: "locations.city",
  is_remote: "locations.is_remote",
  get all() {
    return [this.name, this.remote, this.country, this.city, this.is_remote];
  },
} as const;

function isLocationFilter(filter: string): boolean {
  return location_fields.all.some(attr => filter.startsWith(`${attr}:`));
}

// Disjunctive queries have `facets` as a string (single attr), `hitsPerPage: 0`.
// Main queries have `facets` as an array of all attrs.
// instantsearch sends `facets` as string for disjunctive queries, type says string[]
function isLocationDisjunctive(params: SearchParamsObject): boolean {
  // noinspection SuspiciousTypeOfGuard
  return typeof params.facets === "string" && location_fields.all.includes(params.facets);
}

// noinspection JSDeprecatedSymbols
type SearchInput = SearchMethodParams | LegacySearchMethodProps;

function rewriteSearchParams(params: SearchInput): SearchInput {
  // instantsearch.js legacy format: [{ indexName, params: { facetFilters } }]
  if (Array.isArray(params)) {
    return params.map(req => {
      if (!req.params || !Array.isArray(req.params.facetFilters)) {
        return req;
      }
      return {
        ...req,
        params: {
          ...req.params,
          facetFilters: rewriteLocationFilters(
            req.params.facetFilters as string[][],
            req.params,
          ),
        },
      };
    });
  }
  // algoliasearch v5 format: { requests: [{ facetFilters }] }
  if (!params.requests) {
    return params;
  }
  return {
    ...params,
    requests: params.requests.map(req => {
      if (!("facetFilters" in req) || !Array.isArray(req.facetFilters)) {
        return req;
      }
      return {
        ...req,
        facetFilters: rewriteLocationFilters(
          req.facetFilters as string[][],
          req as SearchParamsObject,
        ),
      };
    }),
  };
}

function rewriteLocationFilters(
  facetFilters: string[][], // always an array of OR groups
  requestParams: SearchParamsObject,
): string[][] {
  const locationGroups: string[][] = [];
  const rest: string[][] = [];
  for (const group of facetFilters) {
    if (group.some(isLocationFilter)) {
      locationGroups.push(group);
    } else {
      rest.push(group);
    }
  }
  if (locationGroups.length === 0) {
    return facetFilters;
  }
  // Disjunctive query for a location attr → strip all location filters
  // so counts reflect global OR semantics, not AND with other location attrs.
  if (isLocationDisjunctive(requestParams)) {
    return rest;
  }
  // Main query with 2+ location groups → merge into single OR group
  if (locationGroups.length >= 2) {
    return [locationGroups.flat(), ...rest];
  }
  return facetFilters;
}
