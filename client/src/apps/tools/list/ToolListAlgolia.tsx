import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaList } from "@/components/algolia/AlgoliaList";
import { PostCard } from "@/components/posts/PostCard/PostCard";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { PostFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { urls } from "@/urls";
import { PostTypeEnum } from "~/graphql/enums";

export function ToolListAlgolia() {
  return (
    <AlgoliaList<PostFragmentType>
      index="indexName"
      typeFilter={PostTypeEnum.Tool}
      label="tool"
      createUrl={urls.tools.create}
      hits={{
        enrichment: {
          query: ToolsByIdsQuery,
          extractItems: data => data.post_tools,
        },
        renderHit: (tool, _ctx) => <PostCard key={tool.id} post={tool} urlNamespace="tools" />,
        listTestId: ids.post.list,
      }}
    >
      <AlgoliaFacetBoolean attribute="has_github_url" label="Has GitHub Link" />
      <AlgoliaFacetAttribute attribute="tool_type" label="Tool Type" />
      <AlgoliaFacetAttribute attribute="tags.name" label="Tags" isSearchEnabled />
    </AlgoliaList>
  );
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
