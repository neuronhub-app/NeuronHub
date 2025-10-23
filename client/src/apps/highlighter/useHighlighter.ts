import type { ResultOf } from "gql.tada";
import { useEffect } from "react";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function useHighlighter(props: { comments?: PostCommentType[] }) {
  const state = useValtioProxyRef({
    commentIds: [] as ID[],
    highlights: {} as Record<ID, PostHighlight[]>,
  });
  useEffect(() => {
    if (props.comments) {
      state.mutable.commentIds = collectIdsRecursively(props.comments);
    }
  }, [props.comments]);

  const { data } = useApolloQuery(PostHighlightsQuery, { ids: state.snap.commentIds });

  useEffect(() => {
    if (data?.post_highlights?.length) {
      const highlights: Record<ID, PostHighlight[]> = {};
      for (const highlight of data.post_highlights) {
        if (highlight?.post?.pk) {
          if (!highlights[highlight.post.pk]) {
            highlights[highlight.post.pk] = [];
          }
          // @ts-expect-error #bad-infer it is not DeepPartial. prob needs gql.tada or Apollo update
          highlights[highlight.post.pk].push(highlight);
        }
      }
      state.mutable.highlights = highlights;
    }
  }, [data]);

  function highlightComment(comment: PostCommentType): PostCommentType {
    if (!state.snap.highlights || !state.snap.highlights[comment.id]) {
      return comment;
    }

    const commentNew = { ...comment };

    let commentNewContent =
      comment.content_polite || comment.content_direct || comment.content_rant;

    for (const postHighlight of state.snap.highlights[comment.id]) {
      const { text, text_prefix, text_postfix } = postHighlight;

      if (commentNewContent.includes(text)) {
        const textHighlighted = `<mark data-testid=${ids.highlighter.span} data-highlight-id="${postHighlight.id}">${text}</mark>`;
        // try matching
        if (text_prefix || text_postfix) {
          const contextPattern = `${text_prefix}${text}${text_postfix}`;
          if (commentNewContent.includes(contextPattern)) {
            commentNewContent = commentNewContent.replace(
              contextPattern,
              `${text_prefix}${textHighlighted}${text_postfix}`,
            );
            continue;
          }
        }
        // fallback to .replace()
        commentNewContent = commentNewContent.replace(text, textHighlighted);
      }
    }
    commentNew.content_polite = commentNewContent;
    commentNew.comments = comment.comments?.map(commentChild => highlightComment(commentChild));
    return commentNew;
  }

  return {
    highlight: highlightComment,
  };
}

const PostHighlightsQuery = graphql(`
  query GetPostHighlights($ids: [ID!]!) {
    post_highlights(post_ids: $ids) { id post { pk } text_prefix text text_postfix }
  }
`);
type PostHighlights = ResultOf<typeof PostHighlightsQuery>;
type PostHighlight = NonNullable<PostHighlights["post_highlights"]>[number];

// const HighlightType = ReturnType

function collectIdsRecursively(comments: PostCommentType[]): ID[] {
  const ids: ID[] = [];
  for (const comment of comments) {
    ids.push(comment.id);
    if (comment.comments && comment.comments.length > 0) {
      ids.push(...collectIdsRecursively(comment.comments));
    }
  }
  return ids;
}
