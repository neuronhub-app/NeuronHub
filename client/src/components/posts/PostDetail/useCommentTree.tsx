import { useCallback, useEffect, useTransition } from "react";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";
import { subscribeKey } from "valtio/vanilla/utils";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { CommentFieldsFragment, type PostCommentType } from "@/graphql/fragments/posts";
import { sleep } from "@/utils/sleep";
import { useInit } from "@/utils/useInit";

const state = proxy({
  commentTree: [] as PostCommentTree[],

  ids: [] as ID[], // to give other React Components an optimized subscription

  isRenderLowPrioAvatars: false,
  isRenderLowPrioReplyButtons: false,

  local: {
    commentThreadsTotal: 0,
    isCommentsLoaded: false, // #prod-redundant
  },
});

subscribeKey(state, "commentTree", () => {
  state.ids = collectCommentIdsRecursively(state.commentTree);
});

export function useCommentTree(props: { postId?: ID }) {
  const snap = useSnapshot(state);

  const [isTransitionPending, startTransition] = useTransition();

  const loadCommentTree = useCallback(
    async (opts?: { isForceGraphqlRefetch: boolean }) => {
      if (!props.postId) {
        return;
      }
      if (!opts?.isForceGraphqlRefetch && state.local.isCommentsLoaded) {
        return;
      }

      const res = await client.query({
        query: PostCommentsQuery,
        variables: { parent_root_id: props.postId },
        fetchPolicy: "network-only",
      });
      const comments = res.data?.post_comments ?? [];

      const performanceLimit = 30;
      if (comments.length > performanceLimit) {
        const commentTree = buildCommentTree(comments);
        state.local.commentThreadsTotal = commentTree.length;
        state.commentTree = sliceThreadsByLimit(commentTree, {
          commentLimit: performanceLimit,
          isMinOneThread: true,
        });

        startTransition(async () => {
          await sleep({ ms: 100 });
          state.commentTree = commentTree;
        });
      } else {
        state.commentTree = buildCommentTree(comments);
      }
      state.local.isCommentsLoaded = true;
    },
    [props.postId],
  );

  const init = useInit({
    isReady: Boolean(props.postId),
    onInit: loadCommentTree,
  });

  useEffect(() => {
    const isRenderInitialCompleted =
      !isTransitionPending &&
      state.local.commentThreadsTotal > 0 &&
      state.local.commentThreadsTotal === state.commentTree.length;

    if (isRenderInitialCompleted) {
      const isRenderSecondaryNeeded = !state.isRenderLowPrioAvatars;
      if (isRenderSecondaryNeeded) {
        startTransition(async () => {
          await sleep({ ms: 250 });
          state.isRenderLowPrioAvatars = true;
          await sleep({ ms: 1000 });
          state.isRenderLowPrioReplyButtons = true;
        });
      }
    }
  }, [isTransitionPending, snap.commentTree.length]);

  return {
    tree: snap.commentTree,
    ids: snap.ids,

    isRenderLowPrioAvatars: snap.isRenderLowPrioAvatars,
    isRenderLowPrioReplyButtons: snap.isRenderLowPrioReplyButtons,

    isRendering: init.isLoading || isTransitionPending,
    isRenderCompleted:
      (!init.isLoading && snap.isRenderLowPrioAvatars && snap.isRenderLowPrioReplyButtons) ||
      (!init.isLoading && snap.ids.length === 0),

    startTransition,
    refetchGraphql: () => loadCommentTree({ isForceGraphqlRefetch: true }),
  };
}

const PostCommentsQuery = graphql.persisted(
  "PostComments",
  graphql(
    `query PostComments($parent_root_id: ID!) {
      post_comments(filters: { parent_root_id: { exact: $parent_root_id } }) {
        ...CommentFieldsFragment
      }
    }`,
    [CommentFieldsFragment],
  ),
);

export type PostCommentTree = PostCommentType[][number] & {
  comments: PostCommentTree[];
};

function buildCommentTree(commentsFlat: PostCommentType[]) {
  const commentMap = new Map<ID, PostCommentTree>();
  const commentTree: PostCommentTree[] = [];

  // set property `Post.comments = []`
  for (const comment of commentsFlat) {
    commentMap.set(comment.id, { ...comment, comments: [] });
  }
  // build commentTree
  for (const comment of commentsFlat) {
    const commentWithChildren = commentMap.get(comment.id)!;

    const isTopLevel = comment.parent?.id === comment.parent_root?.id;
    if (isTopLevel) {
      commentTree.push(commentWithChildren);
    } else if (comment.parent && commentMap.has(comment.parent.id)) {
      const parent = commentMap.get(comment.parent.id)!;
      parent.comments.push(commentWithChildren);
    }
  }

  sortRecursive(commentTree);

  function sortRecursive(comments: PostCommentTree[]) {
    comments.sort(sortByRank);
    for (const comment of comments) {
      sortRecursive(comment.comments);
    }
  }

  return commentTree;
}

// #AI sort descending: higher rank = top; null rank = first. I didn't review it, just tested.
function sortByRank(a: PostCommentTree, b: PostCommentTree) {
  const rankA = a.post_source?.rank;
  const rankB = b.post_source?.rank;
  if (rankA == null && rankB == null) {
    return 0;
  }
  if (rankA == null) {
    return -1;
  }
  if (rankB == null) {
    return 1;
  }
  return rankB - rankA;
}

function sliceThreadsByLimit(
  tree: PostCommentTree[],
  opts: { commentLimit: number; isMinOneThread: boolean },
) {
  const treeSliced: PostCommentTree[] = [];
  let commentsIncludedCount = 0;

  for (const thread of tree) {
    const threadCommentsCount = countCommentsRecursive(thread);

    const isFirstThread = treeSliced.length === 0;
    if (opts.isMinOneThread && isFirstThread) {
      treeSliced.push(thread);
      commentsIncludedCount += threadCommentsCount;
      continue;
    }

    const isUnderLimit = commentsIncludedCount + threadCommentsCount < opts.commentLimit;
    if (isUnderLimit) {
      treeSliced.push(thread);
      commentsIncludedCount += threadCommentsCount;
    }
  }
  return treeSliced;
}

function countCommentsRecursive(node: PostCommentTree): number {
  let count = 1;
  for (const child of node.comments) {
    count += countCommentsRecursive(child);
  }
  return count;
}

function collectCommentIdsRecursively(comments: PostCommentTree[]): ID[] {
  const ids: ID[] = [];
  for (const comment of comments) {
    ids.push(comment.id);
    ids.push(...collectCommentIdsRecursively(comment.comments));
  }
  return ids;
}
