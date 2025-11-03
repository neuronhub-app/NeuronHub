import { For, Heading, HStack, Show, Stack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { proxy } from "valtio";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { PostImportRefreshButton } from "@/components/posts/PostDetail/PostImportRefreshButton";
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
  title: string;
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const highlighter = useHighlighter({ comments: props.post?.comments });

  const idExternal = props.post?.post_source?.id_external;

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
      <HStack justify="space-between" align="center">
        <Heading size="2xl">{props.title}</Heading>
        <Show when={idExternal}>
          <PostImportRefreshButton idExternal={idExternal!} />
        </Show>
      </HStack>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {props.post && (
        <Stack gap="gap.xl">
          <PostCard post={props.post} />

          <Stack gap="gap.lg">
            <Heading size="lg">Comments</Heading>

            <VStack px={0} align="flex-start" gap="gap.md">
              {/* .map() here causes #bad-infer */}
              <For each={props.post.comments}>
                {(comment, _index) => {
                  const isTopComment = comment.parent?.type !== PostTypeEnum.Comment;
                  if (isTopComment) {
                    const topLevelComments = props.post!.comments.filter(
                      c => c.parent?.type !== PostTypeEnum.Comment,
                    );
                    const topLevelIndex = topLevelComments.findIndex(c => c.id === comment.id);
                    return (
                      <CommentThread
                        key={comment.id}
                        comment={highlighter.highlight(comment)}
                        post={props.post!}
                        depth={0}
                        isLastChild={topLevelIndex === topLevelComments.length - 1}
                        isFirstChild={true}
                        height={{ parent: 0, toolbar: 0, avatar: 0 }} // init values
                      />
                    );
                  }
                }}
              </For>
            </VStack>

            <Show when={user}>
              <CommentForm mode="create" parentId={props.post.id} />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
