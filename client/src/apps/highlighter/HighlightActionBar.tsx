import { ActionBar, Button, Kbd } from "@chakra-ui/react";

import { useEffect, useRef } from "react";
import {
  type HighlightedModelType,
  highlight_attrs,
} from "@/apps/highlighter/PostContentHighlighted";
import { saveHighlight } from "@/apps/highlighter/useHighlighter";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function HighlightActionBar() {
  const state = useValtioProxyRef({
    text: "",
    text_prefix: "",
    text_postfix: "",
    isSavable: false,
    isPressedKey: {
      B: false,
      Meta: false,
    },
  });
  const loading = useIsLoading();

  const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleSelection() {
      const selection = document.getSelection();
      if (selection?.toString() && selection.rangeCount > 0) {
        state.mutable.text = selection.toString();
        const { text_prefix, text_postfix, isSavable } = getSelectionContext(selection);
        state.mutable.text_prefix = text_prefix;
        state.mutable.text_postfix = text_postfix;
        state.mutable.isSavable = isSavable;
      } else {
        state.mutable.isSavable = false;
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

  async function handleSave() {
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
    selection.removeAllRanges();
  }

  return (
    <ActionBar.Root
      open={Boolean(state.snap.text && state.snap.isSavable)}
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
            onClick={handleSave}
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
}

function getSelectionContext(selection: Selection): {
  text_prefix: string;
  text_postfix: string;
  isSavable: boolean;
} {
  const selectionRange = selection.getRangeAt(0);

  const selectionElem = isHTMLElement(selectionRange.commonAncestorContainer)
    ? selectionRange.commonAncestorContainer
    : selectionRange.commonAncestorContainer.parentElement;

  if (!selectionElem) {
    return { text_prefix: "", text_postfix: "", isSavable: false };
  }

  const highlightableElem = selectionElem.closest(`[data-${highlight_attrs.flag}]`);
  if (!highlightableElem) {
    return { text_prefix: "", text_postfix: "", isSavable: false };
  }
  return {
    text_prefix: getRangeContext(selectionRange, highlightableElem, "prefix"),
    text_postfix: getRangeContext(selectionRange, highlightableElem, "postfix"),
    isSavable: true,
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
    }
    if (direction === "postfix") {
      textContext = textContext.slice(0, maxChars);
    }
  }
  return textContext;
}

type ModelHighlightable = { id: ID; type: HighlightedModelType };

function findHighlightedModel(args: {
  element: HTMLElement | null;
  depth?: number;
}): ModelHighlightable | null {
  const depth = args.depth ?? 0;

  const isDepthReasonable = depth < 10;
  if (args.element && isDepthReasonable) {
    if (args.element.dataset[highlight_attrs.flag]) {
      return {
        id: args.element.dataset[highlight_attrs.id]!,
        type: args.element.dataset[highlight_attrs.type] as HighlightedModelType,
      };
    }
    return findHighlightedModel({ element: args.element.parentElement, depth: depth + 1 });
  }
  return null;
}

export function isHTMLElement(node: Node | Element | EventTarget | null): node is HTMLElement {
  return (
    // @ts-expect-error #bad-infer
    node?.nodeType === Node.ELEMENT_NODE &&
    // @ts-expect-error #bad-infer
    node.dataset
  );
}
