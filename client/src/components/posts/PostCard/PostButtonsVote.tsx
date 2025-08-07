import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { ids } from "@/e2e/ids";
import { usePostVoting } from "@/hooks/usePostVoting";

export function PostButtonsVote(props: { post: PostListItemType }) {
  const voting = usePostVoting({ postId: props.post.id, votes: props.post.votes });

  return (
    <Stack align="center" color="slate.muted">
      <IconButton
        loading={voting.isLoadingUpvote}
        onClick={() => voting.vote({ isPositive: true })}
        data-state={voting.isVotePositive === true ? "checked" : "unchecked"}
        variant="subtle-ghost"
        borderRadius="lg"
        size="sm"
        {...ids.set(ids.post.vote.up)}
        aria-label="Upvote"
      >
        <FaChevronUp />
      </IconButton>
      <Flex {...ids.set(ids.post.vote.count)}>{voting.sum}</Flex>
      <IconButton
        loading={voting.isLoadingDownvote}
        onClick={() => voting.vote({ isPositive: false })}
        data-state={voting.isVotePositive === false ? "checked" : "unchecked"}
        variant="subtle-ghost"
        borderRadius="lg"
        size="sm"
        {...ids.set(ids.post.vote.down)}
        aria-label="Downvote"
      >
        <FaChevronDown />
      </IconButton>
    </Stack>
  );
}
