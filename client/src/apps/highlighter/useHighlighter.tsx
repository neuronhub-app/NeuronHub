import { useQuery } from "@apollo/client/react";
import type { ResultOf } from "gql.tada";
import { useDebounce } from "use-debounce";
import type { PostCommentTree } from "@/components/posts/PostDetail";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { isQueryDataComplete } from "@/graphql/useApolloQuery";
import { useInit } from "@/utils/useInit";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function useHighlighter(props: {
  commentTree?: PostCommentTree[];
  posts?: Array<{ id: ID; comments?: Array<{ id: ID }> }>;
}) {
  const state = useValtioProxyRef({
    postIds: [] as ID[],
    highlights: {} as Record<ID, PostHighlight[]>,
  });

  // this works for CommentThreads and PostList
  useInit({
    isReady: Boolean(props.commentTree?.length || props.posts?.length),
    deps: [props.commentTree, props.posts],
    onInit: async () => {
      if (props.commentTree) {
        state.mutable.postIds = collectIdsRecursively(props.commentTree);
      } else if (props.posts) {
        // Collect IDs from any posts, not just Comments
        const ids: ID[] = [];
        for (const post of props.posts) {
          ids.push(post.id);
          if (post.comments) {
            ids.push(...collectIdsFromPosts(post.comments));
          }
        }
        state.mutable.postIds = ids;
      }
    },
  });

  const [debouncedPostIds] = useDebounce(state.snap.postIds, 1000);

  const { data } = useQuery(PostHighlightsQuery, {
    variables: { ids: debouncedPostIds },
    skip: !debouncedPostIds.length,
  });

  useInit({
    isReady: Boolean(data),
    deps: [data],
    onInit: async () => {
      if (isQueryDataComplete(data) && data.post_highlights) {
        const highlights: Record<ID, PostHighlight[]> = {};
        for (const highlight of data.post_highlights) {
          if (isQueryDataComplete(highlight) && highlight?.post?.id) {
            if (!highlights[highlight.post.id]) {
              highlights[highlight.post.id] = [];
            }
            highlights[highlight.post.id].push(highlight);
          }
        }
        state.mutable.highlights = highlights;
      }
    },
  });

  return {
    highlights: state.snap.highlights,
  };
}

export async function saveHighlight(args: {
  id: ID;
  text: string;
  text_prefix: string;
  text_postfix: string;
}) {
  await client.mutate({
    mutation: HighlightCreate,
    variables: {
      id: args.id,
      text: args.text,
      text_prefix: args.text_prefix,
      text_postfix: args.text_postfix,
    },
    refetchQueries: [PostHighlightsQuery],
    awaitRefetchQueries: true,
  });
}
const HighlightCreate = graphql.persisted(
  "HighlighterCreate",
  graphql(`
    mutation HighlighterCreate(
      $id: ID!,
      $text: String!,
      $text_prefix: String,
      $text_postfix: String,
    ) {
      post_highlight_create(data: {
        post: { set: $id }
        text: $text
        text_postfix: $text_postfix
        text_prefix: $text_prefix
      })
    }
  `),
);

export async function removeHighlight(id: ID) {
  await client.mutate({
    mutation: HighlightDelete,
    variables: { id },
    refetchQueries: [PostHighlightsQuery],
    awaitRefetchQueries: true,
  });
}
const HighlightDelete = graphql.persisted(
  "HighlighterDelete",
  graphql(`
    mutation HighlighterDelete($id: ID!) {
      post_highlight_delete(data: { id: $id })
    }
  `),
);

const PostHighlightsQuery = graphql.persisted(
  "GetPostHighlights",
  graphql(
    `query GetPostHighlights($ids: [ID!]!) {
      post_highlights(post_ids: $ids) {
        id
        text
        text_prefix
        text_postfix
        created_at
  
        post {
          id
        }
      }
    }`,
  ),
);

type PostHighlights = ResultOf<typeof PostHighlightsQuery>;
export type PostHighlight = NonNullable<PostHighlights["post_highlights"]>[number];

function collectIdsRecursively(comments: PostCommentTree[]): ID[] {
  const ids: ID[] = [];
  for (const comment of comments) {
    ids.push(comment.id);
    if (comment.comments && comment.comments.length > 0) {
      ids.push(...collectIdsRecursively(comment.comments));
    }
  }
  return ids;
}

function collectIdsFromPosts(posts: Array<{ id: ID }>): ID[] {
  return posts.map(p => p.id);
}
