import { useCallback, useEffect, useTransition } from "react";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { CommentFieldsFragment, type PostCommentType } from "@/graphql/fragments/posts";
import { sleep } from "@/utils/sleep";
import { useInit } from "@/utils/useInit";

const state = proxy({
  commentTree: [] as PostCommentTree[],

  isRenderLowPrioAvatars: false,
  isRenderLowPrioReplyButtons: false,

  local: {
    commentThreadsTotal: 0,
    isCommentsLoaded: false,
  },
});

export function useCommentTree(props: { postId?: ID }) {
  const snap = useSnapshot(state);

  const [isTransitionPending, startTransition] = useTransition();

  const loadCommentTree = useCallback(
    async (opts?: { isForceReload: boolean }) => {
      if (!props.postId) {
        return;
      }
      if (state.local.isCommentsLoaded && !opts?.isForceReload) {
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
    isRendering: init.isLoading || isTransitionPending,
    isRenderLowPrioAvatars: snap.isRenderLowPrioAvatars,
    isRenderLowPrioReplyButtons: snap.isRenderLowPrioReplyButtons,
    isRenderCompleted:
      (!init.isLoading && snap.isRenderLowPrioAvatars && snap.isRenderLowPrioReplyButtons) ||
      (!init.isLoading && snap.ids.length === 0),
    startTransition,
    reload: loadCommentTree,
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

  return commentTree;
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
