import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { usePostVote } from "@/hooks/usePostVote";

export function PostButtonsVote(props: { post: PostListItemType }) {
  const { isVotePositive, isLoadingUpvote, isLoadingDownvote, toggleVote, votesSum } =
    usePostVote({
      postId: props.post.id,
      votes: props.post.votes,
    });

  return (
    <Stack align="center" color="slate.muted">
      <IconButton
        loading={isLoadingUpvote}
        onClick={() => toggleVote(true)}
        data-state={isVotePositive === true ? "checked" : "unchecked"}
        aria-label="Upvote"
        variant="subtle-ghost"
        borderRadius="lg"
        size="sm"
        className="btn-upvote"
      >
        <FaChevronUp />
      </IconButton>
      <Flex>{votesSum}</Flex>
      <IconButton
        loading={isLoadingDownvote}
        onClick={() => toggleVote(false)}
        data-state={isVotePositive === false ? "checked" : "unchecked"}
        aria-label="Downvote"
        variant="subtle-ghost"
        borderRadius="lg"
        size="sm"
        className="btn-downvote"
      >
        <FaChevronDown />
      </IconButton>
    </Stack>
  );
}
