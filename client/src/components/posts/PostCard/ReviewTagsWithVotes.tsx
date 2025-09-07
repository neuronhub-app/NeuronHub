import { PostTag } from "@/components/posts/PostCard/PostTags";
import type { ID } from "@/gql-tada";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";

// todo refac-name: PostTagsVoted
export function ReviewTagsWithVotes(props: {
  tags: PostTagFragmentType[];
  authorId: ID;
  reviewId: ID;
}) {
  const tagsWithVote = props.tags.map(tag => {
    // if author voted on review.tags (publicly), not review.parent.tags (privately)
    const authorVote = tag.votes.find(
      vote => vote.author.id === props.authorId && vote.post.id === props.reviewId,
    );
    return {
      ...tag,
      isAuthorVotedPositive: authorVote?.is_vote_positive,
    };
  });
  const tagsSorted = tagsWithVote.sort(tag => {
    if (tag.isAuthorVotedPositive === undefined) {
      return 1;
    }
    return -1;
  });

  return tagsSorted.map(tag => (
    <PostTag
      postId={props.reviewId}
      tag={tag}
      key={tag.id}
      isUserOrAuthorVotedPositive={tag.isAuthorVotedPositive}
      voteTooltip="The reviewer's vote"
    />
  ));
}
