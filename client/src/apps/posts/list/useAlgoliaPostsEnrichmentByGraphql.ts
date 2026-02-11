import { graphql } from "@/gql-tada";
import { PostFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export function useAlgoliaPostsEnrichmentByGraphql(postsAlgolia: PostFragmentType[]) {
  return useAlgoliaEnrichmentByGraphql(postsAlgolia, PostsByIdsQuery, data => data.posts);
}

const PostsByIdsQuery = graphql.persisted(
  "PostsByIds",
  graphql(
    `
    query PostsByIds($ids: [ID!]!) {
      posts(filters: { id: { in_list: $ids } }) {
        ...PostFragment
      }
    }
  `,
    [PostFragment],
  ),
);
