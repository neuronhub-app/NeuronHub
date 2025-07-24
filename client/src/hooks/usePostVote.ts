import { useEffect } from "react";
import { useSnapshot } from "valtio/react";
import { user } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

interface Vote {
  id: ID;
  is_vote_positive: boolean | null;
  author: { id: ID };
}

interface UsePostVoteParams {
  postId: ID;
  votes: Vote[];
}

export function usePostVote({ postId, votes }: UsePostVoteParams) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoadingUpvote: false,
    isLoadingDownvote: false,
    isVotePositive: null as boolean | null,
  });

  useEffect(() => {
    const userVote = userSnap.current?.post_votes.find(vote => vote.post.id === postId);
    state.mutable.isVotePositive = userVote?.is_vote_positive ?? null;
  }, [userSnap.current?.post_votes, postId]);

  const votesSum = votes.reduce((sum, vote) => {
    if (vote.is_vote_positive === true) return sum + 1;
    if (vote.is_vote_positive === false) return sum - 1;
    return sum;
  }, 0);

  const toggleVote = async (isVotePositive: boolean) => {
    if (state.snap.isLoadingUpvote || state.snap.isLoadingDownvote) {
      return;
    }

    if (isVotePositive) {
      state.mutable.isLoadingUpvote = true;
    } else {
      state.mutable.isLoadingDownvote = true;
    }

    let newVoteValue: boolean | null = null;
    if (state.snap.isVotePositive === null) {
      newVoteValue = isVotePositive;
    } else if (state.snap.isVotePositive === isVotePositive) {
      newVoteValue = null;
    } else {
      newVoteValue = isVotePositive;
    }

    await mutateAndRefetch(
      graphql(`
        mutation CreateOrUpdatePostVote($id: ID!, $isVotePositive: Boolean) {
          create_or_update_post_vote(id: $id, is_vote_positive: $isVotePositive)
        }
      `),
      { id: postId, isVotePositive: newVoteValue },
    );

    state.mutable.isLoadingUpvote = false;
    state.mutable.isLoadingDownvote = false;
  };

  return {
    isVotePositive: state.snap.isVotePositive,
    isLoadingUpvote: state.snap.isLoadingUpvote,
    isLoadingDownvote: state.snap.isLoadingDownvote,
    toggleVote,
    votesSum,
  };
}
