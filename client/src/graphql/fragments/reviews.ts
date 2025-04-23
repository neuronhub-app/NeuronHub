import { graphql } from "@/gql-tada";
import { PostCommentsFragment, PostWithoutToolFragment } from "@/graphql/fragments/posts";
import { ToolFragment } from "@/graphql/fragments/tools";

export const PostReviewFragment = graphql(
  `
    fragment PostReviewFragment on PostReviewType {
      ...PostWithoutToolFragment

      importance
      is_private
      is_review_later
      usage_status
      rating
      experience_hours

      reviewed_at

      tool {
        ...ToolFragment
      }
      ...PostCommentsFragment
    }
  `,
  [ToolFragment, PostCommentsFragment, PostWithoutToolFragment],
);
