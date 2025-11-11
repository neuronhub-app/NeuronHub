import toast from "react-hot-toast";
import { useUser } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useInit } from "@/utils/useInit";
import { useStateValtio } from "@/utils/useValtioProxyRef";

export function usePostVoting(props: {
  postId: ID;
  votes: Array<{
    id: ID;
    is_vote_positive: boolean | null;
    author: { id: ID };
  }>;
}) {
  const user = useUser();

  const state = useStateValtio({
    isLoadingUpvote: false,
    isLoadingDownvote: false,
    isVotePositive: null as boolean | null,
  });

  const isLoading = state.snap.isLoadingUpvote || state.snap.isLoadingDownvote;

  useInit({
    onInit: () => {
      const userVote = user?.post_votes.find(vote => props.postId === vote.post.id);
      state.mutable.isVotePositive = userVote?.is_vote_positive ?? null;
    },
    isReady: !isLoading,
    deps: [props.postId, user?.post_votes],
  });

  async function vote(args: { isPositive: boolean }) {
    if (isLoading) {
      return;
    }

    if (args.isPositive) {
      state.mutable.isLoadingUpvote = true;
    } else {
      state.mutable.isLoadingDownvote = true;
    }

    let newVoteValue: boolean | null;
    if (state.snap.isVotePositive === null) {
      newVoteValue = args.isPositive;
    } else if (state.snap.isVotePositive === args.isPositive) {
      newVoteValue = null;
    } else {
      newVoteValue = args.isPositive;
    }

    const res = await mutateAndRefetchMountedQueries(
      graphql(`
        mutation PostVoteUpdateOrCreateOrUpdate($id: ID!, $isVotePositive: Boolean) {
          post_vote_update_or_create(id: $id, is_vote_positive: $isVotePositive)
        }
      `),
      { id: props.postId, isVotePositive: newVoteValue },
    );
    if (!res.success) {
      toast.error(res.errorMessage);
    }

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
