import { graphql } from "@/gql-tada";
import { PostFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export function useAlgoliaToolsEnrichmentByGraphql(toolsAlgolia: PostFragmentType[]) {
  return useAlgoliaEnrichmentByGraphql(toolsAlgolia, ToolsByIdsQuery, data => data.post_tools);
}

const ToolsByIdsQuery = graphql.persisted(
  "ToolsByIds",
  graphql(
    `
    query ToolsByIds($ids: [ID!]!) {
      post_tools(filters: { id: { in_list: $ids } }) {
        ...PostFragment
      }
    }
  `,
    [PostFragment],
  ),
);
