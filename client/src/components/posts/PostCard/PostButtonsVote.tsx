import type { Post } from "@/apps/posts/list/PostList";
import type { PostReview } from "@/apps/reviews/list/PostReviewList";
import { user } from "@/apps/users/useUserCurrent";
import type { ID } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { Flex, IconButton, Stack } from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import { useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useSnapshot } from "valtio/react";

type VoteMutation = TadaDocumentNode<
  { vote_review: boolean } | { vote_post: boolean },
  {
    id: ID;
    isVotePositive: boolean | null;
  }
>;

/**
 * Note is_vote_positive has 3 values: true, false, null
 */
export function PostButtonsVote(props: {
  post: Post | PostReview;
  mutation: VoteMutation;
}) {
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
      <VoteButton id={props.post.id} mutation={props.mutation} isVotePositive={true} />
      <Flex>{votesSum}</Flex>
      <VoteButton id={props.post.id} mutation={props.mutation} isVotePositive={false} />
    </Stack>
  );
}

function VoteButton(props: { id: ID; isVotePositive: boolean; mutation: VoteMutation }) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isVotePositive: null as boolean | null,
  });

  useEffect(() => {
    const userVote = userSnap.current?.tool_review_votes.find(
      vote => vote.review.pk === props.id,
    );
    state.mutable.isVotePositive = userVote?.is_vote_positive ?? null;
  }, [userSnap.current?.tool_review_votes]);

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
        await mutateAndRefetch(props.mutation, { id: props.id, isVotePositive });

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
