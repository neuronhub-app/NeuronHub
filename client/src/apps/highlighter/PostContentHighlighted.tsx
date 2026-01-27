import type * as React from "react";
import { isHTMLElement } from "@/apps/highlighter/HighlightActionBar";
import { PostContentHighlightMenu } from "@/apps/highlighter/PostContentHighlightMenu";
import { type PostHighlight, removeHighlight } from "@/apps/highlighter/useHighlighter";
import { Prose } from "@/components/ui/prose";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import { markedConfigured } from "@/utils/marked-configured";
import { useIsLoading } from "@/utils/useIsLoading";
import { useStateValtio } from "@/utils/useValtioProxyRef";

export const highlight_attrs = {
  flag: "highlightable",
  id: "id",
  highlightId: "highlight-id",
  type: "type",
  highlightActive: "highlight-active",
} as const;

export type HighlightedModelType = "comment" | "post" | "review";

function setHighlighterModelData(id: ID, type: HighlightedModelType) {
  return {
    [`data-${highlight_attrs.flag}`]: true,
    [`data-${highlight_attrs.id}`]: id,
    [`data-${highlight_attrs.type}`]: type,
  };
}

export function PostContentHighlighted(props: {
  post: {
    id: ID;
    content_polite: string;
    content_direct?: string;
    content_rant?: string;
    content_polite_html_ssr?: string;
  };
  highlights: Record<ID, PostHighlight[]>;
}) {
  const state = useStateValtio({
    highlightActiveId: null as ID | null,
  });

  const loading = useIsLoading();

  let contentHTML: string;
  if (props.post.content_polite_html_ssr) {
    contentHTML = highlightPostContentByMarks({
      content: props.post.content_polite_html_ssr,
      highlights: props.highlights[props.post.id] ?? [],
    });
  } else {
    contentHTML = markedConfigured.parse(
      highlightPostContentByMarks({
        content:
          props.post.content_rant ?? props.post.content_direct ?? props.post.content_polite,
        highlights: props.highlights[props.post.id] ?? [],
      }),
      { async: false },
    );
  }

  function onHighlightClick(event: React.MouseEvent) {
    if (isHTMLElement(event.target)) {
      const isHighlightClicked =
        event.target.dataset.highlightId && event.target?.tagName === "MARK";

      if (isHighlightClicked) {
        const isClickWithSelection = document.getSelection()?.toString();
        if (isClickWithSelection) {
          state.mutable.highlightActiveId = null;
          return;
        }
        state.mutable.highlightActiveId = event.target.dataset.highlightId ?? null;
        return;
      }
    }
    state.mutable.highlightActiveId = null;
  }

  async function onHighlightDelete() {
    if (!state.snap.highlightActiveId || loading.isActive) {
      return;
    }

    await loading.track(async () => {
      await removeHighlight(state.snap.highlightActiveId!);
    });
    state.mutable.highlightActiveId = null;
  }

  return (
    <PostContentHighlightMenu
      activeHighlightId={state.snap.highlightActiveId}
      onDelete={onHighlightDelete}
      onClose={() => {
        state.mutable.highlightActiveId = null;
      }}
      loading={loading.isActive}
    >
      <Prose
        onClick={onHighlightClick}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
        dangerouslySetInnerHTML={{ __html: contentHTML }}
        size="sm"
        maxW="3xl"
        {...setHighlighterModelData(props.post.id, "comment")}
      />
    </PostContentHighlightMenu>
  );
}

function highlightPostContentByMarks(args: {
  highlights: PostHighlight[];
  content: string;
}): string {
  let contentNew = args.content;

  for (const highlight of args.highlights) {
    if (!contentNew.includes(highlight.text)) {
      continue;
    }

    const textHighlighted = `<mark data-testid="${ids.highlighter.span}" data-${highlight_attrs.highlightId}="${highlight.id}">${highlight.text}</mark>`;

    // Try context matching first, fallback to simple replace
    if (highlight.text_prefix || highlight.text_postfix) {
      const pattern = `${highlight.text_prefix}${highlight.text}${highlight.text_postfix}`;
      if (contentNew.includes(pattern)) {
        contentNew = contentNew.replace(
          pattern,
          `${highlight.text_prefix}${textHighlighted}${highlight.text_postfix}`,
        );
        continue;
      }
    }
    contentNew = contentNew.replace(highlight.text, textHighlighted);
  }
  return contentNew;
}
