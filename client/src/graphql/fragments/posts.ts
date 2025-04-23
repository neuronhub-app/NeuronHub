import { graphql } from "@/gql-tada";
import { ToolFragment } from "@/graphql/fragments/tools";

/*
 * A fix for `tool` nullability - ie since Graphql lacks syntax `tool! { ...ToolFragment }`
 */
export const PostWithoutToolFragment = graphql(
  `
    fragment PostWithoutToolFragment on PostInterface {
      id
      title
      content
      source
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
      }
      
      updated_at
    }
  `,
);

export const PostFragment = graphql(
  `
    fragment PostFragment on PostInterface {
      ...PostWithoutToolFragment

      tool {
        ...ToolFragment
      }
    }
  `,
  [PostWithoutToolFragment, ToolFragment],
);

export const PostCommentsFragment = graphql(
  `
    fragment PostCommentsFragment on PostInterface {
      comments {
        id
        author {
          id
          username
          avatar {
            url
          }
        }
        created_at
        parent {
          id
        }
        content
        visibility
      }
    }
  `,
);
