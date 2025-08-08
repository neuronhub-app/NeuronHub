import { useEffect } from "react";
import { useSnapshot } from "valtio/react";
import { user } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetchNew";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function usePostVoting(props: {
  postId: ID;
  votes: Array<{
    id: ID;
    is_vote_positive: boolean | null;
    author: { id: ID };
  }>;
}) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoadingUpvote: false,
    isLoadingDownvote: false,
    isVotePositive: null as boolean | null,
  });

  useEffect(() => {
    const userVote = userSnap.current?.post_votes.find(vote => vote.post.id === props.postId);
    state.mutable.isVotePositive = userVote?.is_vote_positive ?? null;
  }, [userSnap.current?.post_votes, props.postId]);

  async function vote(args: { isPositive: boolean }) {
    if (state.snap.isLoadingUpvote || state.snap.isLoadingDownvote) {
      return;
    }

    if (args.isPositive) {
      state.mutable.isLoadingUpvote = true;
    } else {
      state.mutable.isLoadingDownvote = true;
    }

    let newVoteValue: boolean | null = null;
    if (state.snap.isVotePositive === null) {
      newVoteValue = args.isPositive;
    } else if (state.snap.isVotePositive === args.isPositive) {
      newVoteValue = null;
    } else {
      newVoteValue = args.isPositive;
    }

    await mutateAndRefetch(
      graphql(`
        mutation CreateOrUpdatePostVote($id: ID!, $isVotePositive: Boolean) {
          create_or_update_post_vote(id: $id, is_vote_positive: $isVotePositive)
        }
      `),
      { id: props.postId, isVotePositive: newVoteValue },
    );

    state.mutable.isLoadingUpvote = false;
    state.mutable.isLoadingDownvote = false;
  }

  return {
    isVotePositive: state.snap.isVotePositive,
    isLoadingUpvote: state.snap.isLoadingUpvote,
    isLoadingDownvote: state.snap.isLoadingDownvote,
    vote,
    sum: props.votes.reduce((sum, vote) => {
      if (vote.is_vote_positive === true) {
        return sum + 1;
      }
      if (vote.is_vote_positive === false) {
        return sum - 1;
      }
      return sum;
    }, 0),
  };
}
