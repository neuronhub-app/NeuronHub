import { type FragmentOf, graphql } from "@/gql-tada";

export const ToolTagFragment = graphql(`
  fragment ToolTagFragment on ToolTagType {
    id
    name
    description
    is_important
    tag_parent {
      id
      name
    }
    author {
      id
      username
    }
    votes {
      id
      author {
        id
        username
      }
      is_vote_positive
    }
  }
`);

export const ToolFragment = graphql(
  `
    fragment ToolFragment on ToolType {
      id
      name
      github_url
      crunchbase_url
      tags {
        ...ToolTagFragment
      }
    }
  `,
  [ToolTagFragment],
);

export type ToolTag = FragmentOf<typeof ToolTagFragment>;
