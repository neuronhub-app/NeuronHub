import { type FragmentOf, graphql } from "@/gql-tada";
import {
  PostEditFragment,
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

export const PostReviewDetailFragment = graphql(
  `
    fragment PostReviewDetailFragment on PostReviewType {
      ...PostReviewFragment
    }
  `,
  [PostReviewFragment],
);
export type PostReviewDetailFragmentType = FragmentOf<typeof PostReviewDetailFragment>;
export type PostReviewFragmentType = FragmentOf<typeof PostReviewFragment>;

export const PostReviewEditFragment = graphql(
  `
    fragment PostReviewEditFragment on PostReviewType {
      ...PostEditFragment
      ...PostReviewFragment

			is_review_later
    }
  `,
  [PostReviewFragment, PostEditFragment],
);
export type PostReviewEditFragmentType = FragmentOf<typeof PostReviewEditFragment>;

export function isEditMode(
  review?: PostReviewEditFragmentType,
): review is PostReviewEditFragmentType & {
  parent: PostFragmentType;
} {
  return Boolean(review);
}

// we filter out .parent=null in [[PostReviewList.tsx]] #95
export function isReview(
  post: PostFragmentType | PostReviewFragmentType,
): post is PostReviewFragmentType & {
  parent: PostFragmentType;
} {
  return post.__typename === "PostReviewType" && post.parent !== null;
}
