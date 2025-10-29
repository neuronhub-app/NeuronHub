import { Icon, Menu, Portal, Spinner } from "@chakra-ui/react";
import type * as React from "react";
import { useRef } from "react";
import { FaTrashCan } from "react-icons/fa6";

import { highlighter, isHTMLElement } from "@/apps/highlighter/highlighter";
import { Prose } from "@/components/ui/prose";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { markedConfigured } from "@/utils/marked-configured";
import { useIsLoading } from "@/utils/useIsLoading";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { HighlightType } from "@/apps/library/Library";

/**
 * Shows highlights & deletion UI.
 */
export function PostContentHighlighted(props: { post: HighlightType["post"] }) {
  const state = useValtioProxyRef<{
    activeHighlightId: string | null;
  }>({
    activeHighlightId: null,
  });

  const focusedElementRef = useRef<HTMLElement | null>(null);
  const loading = useIsLoading();

  function handleProseClick(event: React.MouseEvent) {
    if (isHTMLElement(event.target)) {
      const isClickedHighlight =
        event.target.dataset.highlightId && event.target?.tagName === "MARK";

      if (isClickedHighlight) {
        const isClickWithSelection = document.getSelection()?.toString();
        if (isClickWithSelection) {
          state.mutable.activeHighlightId = null;
          return;
        }
        state.mutable.activeHighlightId = event.target.dataset.highlightId ?? null;
        focusedElementRef.current = event.target;
        return;
      }
    }
    state.mutable.activeHighlightId = null;
  }

  async function handleDeleteHighlight() {
    if (!state.snap.activeHighlightId) {
      return;
    }
    if (loading.isActive) {
      return;
    }
    await loading.track(async () => {
      await mutateAndRefetchMountedQueries(
        graphql(`
          mutation HighlighterDelete($id: ID!) { post_highlight_delete(data: { id: $id }) }
        `),
        // @ts-expect-error #bad-infer
        { id: state.snap.activeHighlightId },
      );
    });
    state.mutable.activeHighlightId = null;
  }
  return (
    <Menu.Root
      positioning={{
        getAnchorRect: () => {
          const elem = document.querySelector(
            `[data-${highlighter.attrs.highlightId}="${state.snap.activeHighlightId}"]`,
          )!;
          return elem.getBoundingClientRect();
        },
        placement: "bottom",
      }}
      open={Boolean(state.snap.activeHighlightId)}
      onPointerDownOutside={() => {
        state.mutable.activeHighlightId = null;
      }}
    >
      <Prose
        onClick={handleProseClick}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
        dangerouslySetInnerHTML={{
          __html: markedConfigured.parse(
            props.post.content_polite || props.post.content_direct || props.post.content_rant,
          ),
        }}
        size="sm"
        maxW="3xl"
        {...highlighter.setModelData(props.post.id, "comment")}
      />

      <Portal>
        <Menu.Positioner>
          {/* @chakra-ui forgot to define its var()s, so it's a 0x0 square. For now. Adding css={{ --arrow-size=<> }} makes it worse - its CSS written to break <Arrow /> */}
          <Menu.Arrow />

          <Menu.Content minW="auto" p={0}>
            <Menu.Item
              value="remove"
              onClick={handleDeleteHighlight}
              disabled={loading.isActive}
              {...ids.set(ids.highlighter.btn.delete)}
            >
              {loading.isActive ? (
                <Spinner size="sm" />
              ) : (
                <Icon boxSize={4}>
                  <FaTrashCan />
                </Icon>
              )}
              Remove
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
