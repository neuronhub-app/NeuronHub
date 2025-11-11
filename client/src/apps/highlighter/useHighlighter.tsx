import type { ResultOf } from "gql.tada";
import { highlighter } from "@/apps/highlighter/highlighter";
import type { PostCommentTree } from "@/components/posts/PostDetail";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { CommentFieldsFragment, PostFragment } from "@/graphql/fragments/posts";
import { isQueryDataComplete } from "@/graphql/useApolloQuery";
import { useInit } from "@/utils/useInit";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

interface UseHighlighterProps {
  comments?: PostCommentTree[];
  posts?: Array<{ id: ID; comments?: Array<{ id: ID }> }>;
}

export function useHighlighter(props: UseHighlighterProps) {
  const state = useValtioProxyRef({
    postIds: [] as ID[],
    highlights: {} as Record<ID, PostHighlight[]>,
  });

  // this works for CommentThreads and PostList
  useInit({
    isReady: Boolean(props.comments?.length || props.posts?.length),
    deps: [props.comments, props.posts],
    onInit: async () => {
      if (props.comments) {
        state.mutable.postIds = collectIdsRecursively(props.comments);
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

  useInit({
    isReady: state.snap.postIds.length,
    deps: [state.snap.postIds],
    onInit: async () => {
      const res = await client.query({
        query: PostHighlightsQuery,
        variables: { ids: state.snap.postIds },
      });
      const data = res.data!;
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

  function highlight<T extends { id: ID; content_polite: string; comments?: T[] }>(post: T): T {
    if (!state.snap.highlights || !state.snap.highlights[post.id]) {
      return post;
    }
    const postNew = { ...post };
    let postNewContent = post.content_polite;

    for (const postHighlight of state.snap.highlights[post.id]) {
      const { text, text_prefix, text_postfix } = postHighlight;

      if (postNewContent.includes(text)) {
        const textHighlighted = `
          <mark
            data-testid="${ids.highlighter.span}"
            data-${highlighter.attrs.highlightId}="${postHighlight.id}"
            data-${highlighter.attrs.highlightActive}="${false}"
          >${text}</mark>
        `.trim();

        // try matching
        // todo fix: use regex matching. currently breaks if text_prefix/postfix capture `\n` or whatever
        // #AI
        if (text_prefix || text_postfix) {
          const pattern = `${text_prefix}${text}${text_postfix}`;
          if (postNewContent.includes(pattern)) {
            postNewContent = postNewContent.replace(
              pattern,
              `${text_prefix}${textHighlighted}${text_postfix}`,
            );
            continue;
          }
        }
        // fallback to .replace() #AI
        postNewContent = postNewContent.replace(text, textHighlighted);
      }
    }
    postNew.content_polite = postNewContent;
    if (post.comments) {
      postNew.comments = post.comments.map(child => highlight(child));
    }
    return postNew;
  }

  return {
    highlight: highlight,
  };
}

const PostHighlightsQuery = graphql(
  `query GetPostHighlights($ids: [ID!]!) {
    post_highlights(post_ids: $ids) {
      id
      text
      text_prefix
      text_postfix
      created_at

      post {
        ...CommentFieldsFragment
        parent_root {
          ...PostFragment
        }
      }
    }
  }`,
  [PostFragment, CommentFieldsFragment],
);
type PostHighlights = ResultOf<typeof PostHighlightsQuery>;
type PostHighlight = NonNullable<PostHighlights["post_highlights"]>[number];

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
