import { HStack, IconButton, Text } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import type { ID } from "@/gql-tada";
import { usePostVote } from "@/hooks/usePostVote";

interface CommentVoteBarProps {
  comment: {
    id: ID;
    votes: {
      id: ID;
      is_vote_positive: boolean | null;
      author: { id: ID };
    }[];
  };
}

export function CommentVoteBar({ comment }: CommentVoteBarProps) {
  const { isVotePositive, isLoadingUpvote, isLoadingDownvote, toggleVote, votesSum } =
    usePostVote({
      postId: comment.id,
      votes: comment.votes,
    });

  return (
    <HStack color="slate.muted" gap={1}>
      <IconButton
        size="xs"
        variant="ghost"
        loading={isLoadingUpvote}
        onClick={() => toggleVote(true)}
        data-state={isVotePositive === true ? "checked" : "unchecked"}
        className="comment-upvote"
        aria-label="Upvote comment"
      >
        <FaChevronUp />
      </IconButton>
      <Text fontSize="sm" minW={4} textAlign="center">
        {votesSum}
      </Text>
      <IconButton
        size="xs"
        variant="ghost"
        loading={isLoadingDownvote}
        onClick={() => toggleVote(false)}
        data-state={isVotePositive === false ? "checked" : "unchecked"}
        className="comment-downvote"
        aria-label="Downvote comment"
      >
        <FaChevronDown />
      </IconButton>
    </HStack>
  );
}
