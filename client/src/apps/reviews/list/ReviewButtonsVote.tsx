import type { ReviewType } from "@/apps/reviews/list/index";
import { user } from "@/apps/users/useUserCurrent";
import { graphql } from "@/gql-tada";
import { refetchAllQueries } from "@/urql/refetchExchange";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useClient } from "urql";
import { useSnapshot } from "valtio/react";

/**
 * Note is_vote_positive has 3 values: true, false, null
 */
export function ReviewButtonsVote(props: { review: ReviewType }) {
  let votesSum = 0;
  for (const vote of props.review.votes) {
    if (vote.is_vote_positive === true) {
      votesSum++;
    }
    if (vote.is_vote_positive === false) {
      votesSum--;
    }
  }

  return (
    <Stack align="center" color="slate.muted">
      <ReviewVoteButton reviewId={props.review.id} isVotePositive={true} />
      <Flex>{votesSum}</Flex>
      <ReviewVoteButton reviewId={props.review.id} isVotePositive={false} />
    </Stack>
  );
}

function ReviewVoteButton(props: { reviewId: string; isVotePositive: boolean }) {
  const client = useClient();
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isVotePositive: null as boolean | null,
  });

  useEffect(() => {
    const userVote = userSnap.current?.tool_review_votes.find(
      vote => vote.review.pk === props.reviewId,
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
        const res = await toggleUserReviewVote({
          client,
          reviewId: props.reviewId,
          isVotePositive: isVotePositive,
        });
        if (res.success) {
          await refetchAllQueries();
        } else {
          toast.error(res.error);
        }
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

async function toggleUserReviewVote(args: {
  client: ReturnType<typeof useClient>;
  reviewId: string;
  isVotePositive: boolean | null;
}) {
  const res = await args.client
    .mutation(
      graphql(
        `
          mutation vote_review($reviewId: ID!, $isVotePositive: Boolean) {
            vote_review(review_id: $reviewId, is_vote_positive: $isVotePositive)
          }
        `,
      ),
      args,
    )
    .toPromise();

  if (res.error) {
    captureException(res.error);
    return { success: false, error: res.error.message } as const;
  }
  return { success: true } as const;
}
