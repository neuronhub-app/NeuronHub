import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagFragment } from "@/graphql/fragments/tags";

export const PostFragment = graphql(
  `
    fragment PostFragment on PostTypeI {
      id
      __typename
      type
      title
      content
      source
      crunchbase_url
      github_url
      url
      domain
      
      author {
        id
        username
        avatar {
          url
        }
      }
      votes {
        id
        is_vote_positive
      }
      comments {
        id
        type
        content
        author {
          id
          username
        }
        created_at
        updated_at
      }
      parent {
        id
        __typename
        title
        tags {
          ...PostTagFragment
        }
      }
      updated_at

      tags {
        ...PostTagFragment
      }
    }
  `,
  [PostTagFragment],
);

export const PostCommentsFragment = graphql(
  `
    fragment PostCommentsFragment on PostTypeI {
      comments {
        id
        type
        __typename
        author {
          id
          username
          avatar {
            url
          }
        }
        parent {
          id
        }
        content
        visibility
        created_at
        updated_at
      }
    }
  `,
);

export const PostDetailFragment = graphql(
  `
    fragment PostDetailFragment on PostTypeI {
      ...PostFragment
      ...PostCommentsFragment
    }
  `,
  [PostFragment, PostCommentsFragment],
);

export type PostFragmentType = FragmentOf<typeof PostFragment>;

export type PostDetailFragmentType = FragmentOf<typeof PostDetailFragment>;
