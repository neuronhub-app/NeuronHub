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

    const state = useValtioProxyRef({
      text: "",
      text_prefix: "",
      text_postfix: "",
      isPressedKey: {
        B: false,
        Meta: false,
      },
    });
    const loading = useIsLoading();

    useEffect(() => {
      function handleSelection() {
        const selection = document.getSelection();
        if (selection?.toString() && selection.rangeCount > 0) {
          state.mutable.text = selection.toString();
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
      document.addEventListener("keydown", handleShortcut);
      return () => {
        document.removeEventListener("keydown", handleShortcut);
      };
    }, []);

    // todo refac: move out to reduce complexity
    useEffect(() => {
      function isKeyMeta(event: KeyboardEvent) {
        return event.key === "Meta" || event.code === "MetaLeft" || event.code === "MetaRight";
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.code === "KeyB") {
          state.mutable.isPressedKey.B = true;
        }
        if (isKeyMeta(event)) {
          state.mutable.isPressedKey.Meta = true;
        }
      }

      function handleKeyUp(event: KeyboardEvent) {
        if (event.code === "KeyB") {
          state.mutable.isPressedKey.B = false;
        }
        if (isKeyMeta(event)) {
          state.mutable.isPressedKey.Meta = false;
        }
      }

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, []);

    const isTextSelected = Boolean(state.snap.text);

    return {
      component: () => {
        return (
          <ActionBar.Root
            open={isTextSelected}
            initialFocusEl={() => saveButtonRef.current}
            skipAnimationOnMount={true}
            immediate={true}
          >
            <ActionBar.Positioner>
              <ActionBar.Content p={0} animationDuration="0s">
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
                    state.mutable.isPressedKey.Meta = false;
                    state.mutable.isPressedKey.B = false;
                    selection.empty();
                  }}
                >
                  Highlight{" "}
                  <Kbd
                    size="sm"
                    fontSize="2xs"
                    variant={state.snap.isPressedKey.Meta ? "raised" : "outline"}
                  >
                    Meta
                  </Kbd>
                  +
                  <Kbd
                    size="sm"
                    fontSize="2xs"
                    variant={state.snap.isPressedKey.B ? "raised" : "outline"}
                  >
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
    maxChars: number = 40,
  ): string {
    const elemRange = document.createRange();
    elemRange.selectNodeContents(highlightableElem);

    if (direction === "prefix") {
      elemRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);
    }
    if (direction === "postfix") {
      elemRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
    }

    let textContext = elemRange.toString();

    const isTrimNeeded = textContext.length > maxChars;
    if (isTrimNeeded) {
      if (direction === "prefix") {
        textContext = textContext.slice(-maxChars);
        // const firstSpaceIndex = textContext.indexOf(" ");
        // // For prefix, trim at first word boundary but preserve trailing spaces
        // // if (firstSpaceIndex > 0 && firstSpaceIndex < text.length - 1) {
        // if (firstSpaceIndex > 0) { // why?
        //   textContext = textContext.slice(firstSpaceIndex + 1);
        // }
      }
      if (direction === "postfix") {
        textContext = textContext.slice(0, maxChars);
        // const lastSpaceIndex = textContext.lastIndexOf(" ");
        // if (lastSpaceIndex > 0) { // why?
        // // trim at last word boundary but preserve leading spaces
        // // if (lastSpaceIndex > 0 && lastSpaceIndex < text.length - 1) {
        //   textContext = textContext.slice(0, lastSpaceIndex);
        // }
      }
    }
    return textContext;
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
