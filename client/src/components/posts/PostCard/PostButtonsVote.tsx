import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useSnapshot } from "valtio/react";
import { user } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

/**
 * Note is_vote_positive has 3 values: true, false, null
 */
export function PostButtonsVote(props: { post: PostListItemType }) {
  let votesSum = 0;
  for (const vote of props.post.votes) {
    if (vote.is_vote_positive === true) {
      votesSum++;
    }
    if (vote.is_vote_positive === false) {
      votesSum--;
    }
  }

  return (
    <Stack align="center" color="slate.muted">
      <VoteButton id={props.post.id} isVotePositive={true} />
      <Flex>{votesSum}</Flex>
      <VoteButton id={props.post.id} isVotePositive={false} />
    </Stack>
  );
}

function VoteButton(props: { id: ID; isVotePositive: boolean }) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isVotePositive: null as boolean | null,
  });

  useEffect(() => {
    const userVote = userSnap.current?.post_votes.find(vote => vote.post.id === props.id);
    state.mutable.isVotePositive = userVote?.is_vote_positive ?? null;
  }, [userSnap.current?.post_votes, props.id]);

  return (
    <IconButton
      loading={state.snap.isLoading}
      onClick={async () => {
        if (state.snap.isLoading) {
          return;
        }
        state.mutable.isLoading = true;

        let isVotePositive: boolean | null = null;
        if (state.snap.isVotePositive === null) {
          isVotePositive = props.isVotePositive;
        }
        await mutateAndRefetch(
          graphql(`
            mutation CreateOrUpdatePostVote($id: ID!, $isVotePositive: Boolean) {
              create_or_update_post_vote(id: $id, is_vote_positive: $isVotePositive)
            }
          `),
          { id: props.id, isVotePositive },
        );

        state.mutable.isLoading = false;
      }}
      data-state={state.snap.isVotePositive === props.isVotePositive ? "checked" : "unchecked"}
      aria-label={props.isVotePositive ? "Upvote" : "Downvote"}
      variant="subtle-ghost"
      borderRadius="lg"
      size="sm"
    >
      {props.isVotePositive ? <FaChevronUp /> : <FaChevronDown />}
    </IconButton>
  );
}
