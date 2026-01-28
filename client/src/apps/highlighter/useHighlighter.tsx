import type { ResultOf } from "gql.tada";
import { useTransition } from "react";
import { proxyMap } from "valtio/utils";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { isQueryDataComplete } from "@/graphql/useApolloQuery";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";

type CommentID = ID;

/**
 * Global state for subscribe() in [[PostContentHighlighted.tsx]] and others.
 */
export const highlightsMap = proxyMap<CommentID, PostHighlight[]>();

/**
 * Loads PostHighlight[] into global Valtio state.
 *
 * Uses optimistic mutations.
 *
 * Note: it's only mounted once in <PostDetail/> - so it's easy to miss bad React code.
 */
export function useHighlighter(props: { commentIds: CommentID[] }) {
  const [, startTransition] = useTransition();

  useInit({
    isReady: props.commentIds?.length,
    dependencies: [props.commentIds],
    onInit: loadHighlights,
  });

  async function loadHighlights() {
    startTransition(async () => {
      const { data } = await client.query({
        query: PostHighlightsQuery,
        variables: { ids: props.commentIds },
        fetchPolicy: "network-only",
      });

      if (isQueryDataComplete(data)) {
        const mapNew = new Map<CommentID, PostHighlight[]>();

        for (const highlight of data.post_highlights) {
          const id = highlight.post.id;
          const highlights = mapNew.get(id) ?? [];

          mapNew.set(id, [...highlights, highlight]);
        }
        for (const id of props.commentIds) {
          highlightsMap.set(id, mapNew.get(id) ?? []);
        }
      }
    });
  }
}

export async function saveHighlight(args: {
  id: ID;
  text: string;
  text_prefix: string;
  text_postfix: string;
  post: { id: CommentID };
}) {
  // Optimistic update
  const highlightsOld = highlightsMap.get(args.post.id)!;
  highlightsMap.set(args.post.id, [...highlightsOld, args]);

  const res = client.mutate({
    mutation: HighlightCreate,
    variables: {
      id: args.id,
      text: args.text,
      text_prefix: args.text_prefix,
      text_postfix: args.text_postfix,
    },
    optimisticResponse: { post_highlight_create: true },
  });
  res.catch(error => {
    toast.error(error);

    highlightsMap.set(args.post.id, highlightsOld);
  });
}

export async function removeHighlight(id: ID, commentId: CommentID) {
  // Optimistic update
  highlightsMap.set(
    commentId,
    highlightsMap.get(commentId)!.filter(highlight => highlight.id !== id),
  );

  const res = client.mutate({
    mutation: HighlightDelete,
    variables: { id },
    optimisticResponse: { post_highlight_delete: true },
  });
  res.catch(error => toast.error(error));
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

const HighlightDelete = graphql.persisted(
  "HighlighterDelete",
  graphql(`mutation HighlighterDelete($id: ID!) { post_highlight_delete(data: { id: $id }) }`),
);

const PostHighlightsQuery = graphql.persisted(
  "PostHighlightsQuery",
  graphql(
    `query PostHighlightsQuery($ids: [ID!]!) {
      post_highlights(post_ids: $ids) {
        id
        post { id }
        text
        text_prefix
        text_postfix
      }
    }`,
  ),
);

type PostHighlights = ResultOf<typeof PostHighlightsQuery>;
export type PostHighlight = NonNullable<PostHighlights["post_highlights"]>[number];
