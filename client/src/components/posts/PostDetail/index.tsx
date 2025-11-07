import { For, Heading, Show, Stack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { proxy } from "valtio";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { useInit } from "@/utils/useInit";
import { PostTypeEnum } from "~/graphql/enums";

export const collapsedCommentsState = proxy({
  collapsedCommentIds: new Set<ID>(),
});

export function PostDetail(props: {
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const commentTree = useMemo(
    () => (props.post?.comments ? buildCommentTree(props.post.comments) : []),
    [props.post?.comments],
  );

  const highlighter = useHighlighter({ comments: commentTree });

  useInit({
    isBlocked: !(user && props.post?.id),
    onInit: async () => {
      const res = await client.query({
        query: graphql(
          `
            query UserCollapsedComments($parent_root_id: ID!) {
              user_current {
                id
                posts_collapsed(filters: { parent_root_id: { exact: $parent_root_id } }) {
                  id
                }
              }
            }
          `,
        ),
        variables: { parent_root_id: props.post!.id },
      });
      collapsedCommentsState.collapsedCommentIds = new Set(
        res.data!.user_current!.posts_collapsed.map(post => post.id),
      );
    },
  });

  return (
    <Stack>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {props.post && (
        <Stack gap="gap.xl">
          <PostCard post={props.post} isDetailPage />

          <Stack gap={commentTree.length ? "gap.lg" : "0"}>
            <Heading fontSize="lg" display="flex" gap="gap.sm" alignItems="center">
              Comments <Text color="fg.subtle">{props.post.comments_count}</Text>
            </Heading>

            <Show when={commentTree.length > 0}>
              <VStack px={0} align="flex-start" gap="gap.md">
                {/* Render top-level comments from the tree */}
                <For each={commentTree}>
                  {(comment, index) => (
                    <CommentThread
                      key={comment.id}
                      comment={highlighter.highlight(comment)}
                      post={props.post!}
                      depth={0}
                      isLastChild={index === commentTree.length - 1}
                      isFirstChild={true}
                      height={{ parent: 0, toolbar: 0, avatar: 0 }} // init values
                    />
                  )}
                </For>
              </VStack>
            </Show>

            <Show when={user}>
              <CommentForm mode="create" parentId={props.post.id} />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export type PostCommentTree = PostDetailFragmentType["comments"][number] & {
  comments: PostCommentTree[];
};

function buildCommentTree(commentsFlat: PostDetailFragmentType["comments"]) {
  const commentMap = new Map<ID, PostCommentTree>();
  const commentTree: PostCommentTree[] = [];

  // set `.comments = []`
  for (const comment of commentsFlat) {
    commentMap.set(comment.id, { ...comment, comments: [] });
  }
  // build commentTree
  for (const comment of commentsFlat) {
    const commentWithChildren = commentMap.get(comment.id)!;

    const isTopLevel = !comment.parent || comment.parent.type !== PostTypeEnum.Comment;
    if (isTopLevel) {
      commentTree.push(commentWithChildren);
    } else if (comment.parent && commentMap.has(comment.parent.id)) {
      const parent = commentMap.get(comment.parent.id)!;
      parent.comments.push(commentWithChildren);
    }
  }

  return commentTree;
}
