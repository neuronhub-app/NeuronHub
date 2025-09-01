import { ids } from "@/e2e/ids";
import { type FragmentOf, graphql } from "@/gql-tada";
import {
  PostCommentsFragment,
  PostFragment,
  type PostFragmentType,
} from "@/graphql/fragments/posts";
import { PostTagFragment } from "@/graphql/fragments/tags";

export const PostReviewFragment = graphql(
  `
    fragment PostReviewFragment on PostReviewType {
      ...PostFragment

			review_tags {
				...PostTagFragment
			}
      review_importance
      review_usage_status
      review_rating
      review_experience_hours
      reviewed_at
    }
  `,
  [PostFragment, PostTagFragment],
);

// Review detail

export const PostReviewDetailFragment = graphql(
  `
    fragment PostReviewDetailFragment on PostReviewType {
      ...PostReviewFragment
      ...PostCommentsFragment
    }
  `,
  [PostReviewFragment, PostCommentsFragment],
);
export type PostReviewDetailFragmentType = FragmentOf<typeof PostReviewDetailFragment>;
export type PostReviewFragmentType = FragmentOf<typeof PostReviewFragment> & {
  parent: PostFragmentType;
};

export function isReview(
  post: PostFragmentType | PostReviewFragmentType,
): post is PostReviewFragmentType {
  return post.__typename === "PostReviewType";
}

// Review edit

export const PostReviewEditFragment = graphql(
  `
    fragment PostReviewEditFragment on PostReviewType {
      ...PostReviewFragment
      ...PostCommentsFragment

			content_private
			is_review_later

      visibility
      recommended_to_users {
        id
        username
      }
      recommended_to_groups {
        id
        name
      }
      visible_to_users {
        id
        username
      }
      visible_to_groups {
        id
        name
      }
    }
  `,
  [PostReviewFragment, PostCommentsFragment],
);
export type PostReviewEditFragmentType = FragmentOf<typeof PostReviewEditFragment>;

export function isEditMode(
  review?: PostReviewEditFragmentType,
): review is PostReviewEditFragmentType & {
  parent: PostFragmentType;
} {
  return Boolean(review);
}
