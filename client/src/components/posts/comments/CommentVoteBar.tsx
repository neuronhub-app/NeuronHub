import { HStack, IconButton, Text } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";
import { usePostVoting } from "@/hooks/usePostVoting";

// todo refac: dedup with [[PostButtonsVote.tsx]]
export function CommentVoteBar(props: { comment: { id: ID; votes: PostCommentType["votes"] } }) {
  const voting = usePostVoting({ postId: props.comment.id, votes: props.comment.votes });

  return (
    <HStack color="slate.muted" gap={1}>
      <IconButton
        loading={voting.isLoadingUpvote}
        onClick={() => voting.vote({ isPositive: true })}
        data-state={voting.isVotePositive === true ? "checked" : "unchecked"}
        size="xs"
        variant="ghost"
        {...ids.set(ids.comment.vote.up)}
        aria-label="Upvote comment"
      >
        <FaChevronUp />
      </IconButton>
      <Text fontSize="sm" minW={4} textAlign="center">
        {voting.sum}
      </Text>
      <IconButton
        loading={voting.isLoadingDownvote}
        onClick={() => voting.vote({ isPositive: false })}
        data-state={voting.isVotePositive === false ? "checked" : "unchecked"}
        size="xs"
        variant="ghost"
        {...ids.set(ids.comment.vote.down)}
        aria-label="Downvote comment"
      >
        <FaChevronDown />
      </IconButton>
    </HStack>
  );
}
