import { ActionBar, Button, Kbd } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export namespace highlighter {
  export function useHook() {
    const saveButtonRef = useRef<HTMLButtonElement | null>(null);

    const state = useValtioProxyRef({ text: "", text_prefix: "", text_postfix: "" });
    const loading = useIsLoading();

    const isTextSelected = Boolean(document.getSelection()?.toString());

    useEffect(() => {
      function handleSelection() {
        const selection = document.getSelection();
        if (selection?.toString() && selection.rangeCount > 0) {
          state.mutable.text = selection.toString().trim(); // #AI not sure why, we try to match verbatim. it seems to work atm
          const { text_prefix, text_postfix } = getSelectionContext(selection);
          state.mutable.text_prefix = text_prefix;
          state.mutable.text_postfix = text_postfix;
        } else {
          state.mutable.text = "";
          state.mutable.text_prefix = "";
          state.mutable.text_postfix = "";
        }
      }
      document.addEventListener("selectionchange", handleSelection);
      return () => {
        document.removeEventListener("selectionchange", handleSelection);
      };
    }, []);

    useEffect(() => {
      function handleShortcut(event: KeyboardEvent) {
        if (state.mutable.text && event.metaKey && event.code === "KeyB") {
          saveButtonRef.current!.click();
        }
      }
      window.addEventListener("keydown", handleShortcut);
      return () => {
        window.removeEventListener("keydown", handleShortcut);
      };
    }, []);

    return {
      component: () => {
        return (
          <ActionBar.Root open={isTextSelected} initialFocusEl={() => saveButtonRef.current}>
            <ActionBar.Positioner>
              <ActionBar.Content p={0}>
                <Button
                  size="xs"
                  variant="ghost"
                  ref={saveButtonRef}
                  loading={loading.isActive}
                  {...ids.set(ids.highlighter.btn.save)}
                  onClick={async () => {
                    const selection = document.getSelection()!;

                    await loading.track(async () => {
                      if (!selection.focusNode?.parentElement) {
                        return toast.error("Invalid selection");
                      }
                      const highlightModel = findHighlightedModel({
                        element: selection.focusNode.parentElement,
                      });
                      if (highlightModel) {
                        await saveHighlight({
                          id: highlightModel.id,
                          text: state.mutable.text,
                          text_prefix: state.mutable.text_prefix,
                          text_postfix: state.mutable.text_postfix,
                        });
                      }
                    });

                    state.mutable.text = "";
                    state.mutable.text_prefix = "";
                    state.mutable.text_postfix = "";
                    selection.empty();
                  }}
                >
                  Highlight{" "}
                  <Kbd size="sm" fontSize="2xs">
                    Meta
                  </Kbd>
                  +
                  <Kbd size="sm" fontSize="2xs">
                    B
                  </Kbd>
                </Button>
              </ActionBar.Content>
            </ActionBar.Positioner>
          </ActionBar.Root>
        );
      },
    };
  }

  export function setModelData(id: ID, type: highlighter.ModelType) {
    return {
      [`data-${attrs.flag}`]: true,
      [`data-${attrs.id}`]: id,
      [`data-${attrs.type}`]: type,
    };
  }

  function getSelectionContext(selection: Selection): {
    text_prefix: string;
    text_postfix: string;
  } {
    const selectionRange = selection.getRangeAt(0);

    const selectionElem = isHTMLElement(selectionRange.commonAncestorContainer)
      ? selectionRange.commonAncestorContainer
      : selectionRange.commonAncestorContainer.parentElement;

    if (!selectionElem) {
      return { text_prefix: "", text_postfix: "" };
    }

    const highlightableElem = selectionElem.closest(`[data-${attrs.flag}]`);
    if (!highlightableElem) {
      return { text_prefix: "", text_postfix: "" };
    }
    return {
      text_prefix: getRangeContext(selectionRange, highlightableElem, "prefix"),
      text_postfix: getRangeContext(selectionRange, highlightableElem, "postfix"),
    };
  }

  function getRangeContext(
    selectionRange: Range,
    highlightableElem: Element,
    direction: "prefix" | "postfix",
    maxChars: number = 20,
  ): string {
    const elemRange = document.createRange();
    elemRange.selectNodeContents(highlightableElem);

    if (direction === "prefix") {
      elemRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);
    } else {
      elemRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
    }

    let text = elemRange.toString();
    if (text.length > maxChars) {
      if (direction === "prefix") {
        text = text.slice(-maxChars);
        const firstSpaceIndex = text.indexOf(" ");
        if (firstSpaceIndex > 0) {
          text = text.slice(firstSpaceIndex + 1);
        }
      } else {
        text = text.slice(0, maxChars);
        const lastSpaceIndex = text.lastIndexOf(" ");
        if (lastSpaceIndex > 0) {
          text = text.slice(0, lastSpaceIndex);
        }
      }
    }
    return text.trim(); // #AI not sure why, we try to match verbatim. it seems to work atm
  }

  async function saveHighlight(args: {
    id: ID;
    text: string;
    text_prefix: string;
    text_postfix: string;
  }) {
    console.log(attrs.flag, args);

    await mutateAndRefetchMountedQueries(
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
      {
        id: args.id,
        text: args.text,
        text_prefix: args.text_prefix,
        text_postfix: args.text_postfix,
      },
    );
  }

  export type ModelType = "comment" | "post" | "review";

  export const attrs = {
    flag: "highlightable",
    id: "id",
    highlightId: "highlight-id",
    type: "type",
    highlightActive: "highlight-active",
  } as const;

  type ModelHighlightable = { id: ID; type: highlighter.ModelType };

  function findHighlightedModel(args: {
    element: HTMLElement | null;
    depth?: number;
  }): ModelHighlightable | null {
    const depth = args.depth ?? 0;

    const isDepthReasonable = depth < 10;
    if (args.element && isDepthReasonable) {
      if (args.element.dataset[attrs.flag]) {
        return {
          id: args.element.dataset[attrs.id]!,
          type: args.element.dataset[attrs.type] as highlighter.ModelType,
        };
      } else {
        return findHighlightedModel({ element: args.element.parentElement, depth: depth + 1 });
      }
    }
    return null;
  }
}

export function isHTMLElement(node: Node | Element | EventTarget | null): node is HTMLElement {
  return (
    // @ts-expect-error #bad-infer
    node?.nodeType === Node.ELEMENT_NODE &&
    // @ts-expect-error #bad-infer
    node.dataset
  );
}
