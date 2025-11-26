import {
  Box,
  Flex,
  For,
  Heading,
  HStack,
  Show,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { type ReactNode, useMemo, useRef } from "react";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { useMetaTitle } from "@/components/useMetaTitle";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import {
  CommentFieldsFragment,
  type PostCommentType,
  type PostDetailFragmentType,
} from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { useInit } from "@/utils/useInit";
import { useStateValtio, useStateValtioSet } from "@/utils/useValtioProxyRef";
import { UserListName } from "~/graphql/enums";

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

export function PostDetail(props: {
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const collapsedIds = useStateValtioSet(new Set<ID>());

  const state = useStateValtio({
    comments: null as PostCommentType[] | null,
  });

  const commentNodeFinal = useRef(null);

  const commentTree = useMemo(
    () => (state.snap.comments ? buildCommentTree(state.snap.comments) : []),
    [state.snap.comments],
  );

  const highlighter = useHighlighter({ commentTree });

  const title = useMetaTitle({ isLoading: true });

  const commentsInit = useInit({
    isReady: Boolean(props.post?.id),
    onInit: async () => {
      const res = await client.query({
        query: PostCommentsQuery,
        variables: { parent_root_id: props.post!.id },
      });
      state.mutable.comments = res.data?.post_comments ?? [];
    },
  });

  useInit({
    isReady: Boolean(user && props.post?.id),
    onInit: async () => {
      title.set(props.post!.title);

      const res = await client.query({
        query: UserCollapsedCommentsQuery,
        variables: { parent_root_id: props.post!.id },
      });
      collapsedIds.mutable.clear();
      res.data!.user_current!.posts_collapsed.forEach(post => {
        collapsedIds.mutable.add(post.id);
      });
    },
  });

  async function toggleCollapse(id: ID) {
    if (collapsedIds.snap.has(id)) {
      collapsedIds.mutable.delete(id);
    } else {
      collapsedIds.mutable.add(id);
    }

    if (user) {
      await client.mutate({
        mutation: UpdateCollapsedCommentsMutation,
        variables: {
          id,
          list_field_name: UserListName.PostsCollapsed,
          is_added: collapsedIds.snap.has(id),
        },
      });
    }
  }

  const post = props.post;

  return (
    <Stack>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {post && (
        <Stack gap="gap.xl">
          <PostCard post={post} isDetailPage urlNamespace="posts" />

          <Stack gap={commentTree.length ? "gap.lg" : "0"}>
            <Heading fontSize="lg" display="flex" gap="gap.sm" alignItems="center">
              Comments <Text color="fg.subtle">{post.comments_count}</Text>
            </Heading>

            <VStack px={0} align="flex-start" gap="gap.md">
              {/* Render top-level comments from the tree */}

              <For
                each={commentTree}
                fallback={[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                  <Box w="full" mt="gap.md" key={index}>
                    <Flex gap="gap.sm">
                      <VStack gap={0}>
                        <SkeletonCircle w={6} h={6} />
                      </VStack>

                      <VStack align="flex-start" gap="gap.sm" w="full">
                        <VStack align="flex-start" px="1" rounded="l3" w="full" gap="3">
                          <HStack>
                            <Skeleton w={16} h={5} />
                            <Skeleton w={16} h={5} />
                          </HStack>
                          <SkeletonText noOfLines={3} />
                        </VStack>

                        <Spacer w="1.5" h="full" />

                        <Flex gap="gap.sm" px="1">
                          <Skeleton w={5} h={5} />
                          <Skeleton w={5} h={5} />
                          <Skeleton w={10} h={5} />
                        </Flex>
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              >
                {(comment, index) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    highlights={highlighter.highlights}
                    collapsedIds={collapsedIds.snap}
                    toggleCollapse={toggleCollapse}
                    post={post}
                    depth={0}
                    isLastChild={index === commentTree.length - 1}
                    isFirstChild={true}
                    height={{ parent: 0, toolbar: 0, avatar: 0 }} // init values
                  />
                )}
              </For>
            </VStack>

            <Show when={user}>
              <CommentForm mode="create" parentId={post.id} />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
const UserCollapsedCommentsQuery = graphql.persisted(
  "UserCollapsedComments",
  graphql(`
    query UserCollapsedComments($parent_root_id: ID!) {
      user_current {
        id
        posts_collapsed(filters: { parent_root_id: { exact: $parent_root_id } }) {
          id
        }
      }
    }
  `),
);
const UpdateCollapsedCommentsMutation = graphql.persisted(
  "UpdateCollapsedComments",
  graphql(`
    mutation UpdateCollapsedComments($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
      update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
    }
  `),
);

export type PostCommentTree = PostCommentType[][number] & {
  comments: PostCommentTree[];
};

function buildCommentTree(commentsFlat: PostCommentType[]) {
  const commentMap = new Map<ID, PostCommentTree>();
  const commentTree: PostCommentTree[] = [];

  // set `.comments = []`
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
