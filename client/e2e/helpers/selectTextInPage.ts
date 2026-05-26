import type { Page } from "@playwright/test";

import { highlight_attrs } from "@/apps/highlighter/PostContentHighlighted";

/**
 * #AI #quality-25%
 * Programmatic text Selection inside a `data-highlightable` Prose.
 * The HighlightActionBar's `selectionchange` listener picks it up and opens the action bar.
 */
export async function selectTextHighlightable(page: Page, target: string): Promise<void> {
  await page.evaluate(
    args => {
      const elsHighlightable = document.querySelectorAll(`[data-${args.flag}]`);
      let proseEl: Element | null = null;
      for (const el of elsHighlightable) {
        if (el.textContent?.includes(args.target)) {
          proseEl = el;
          break;
        }
      }
      if (!proseEl) {
        throw new Error(`Highlightable element with "${args.target}" not found`);
      }

      let textNode: Text | null = null;
      const walker = document.createTreeWalker(proseEl, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node !== null) {
        if (node.textContent?.includes(args.target)) {
          textNode = node as Text;
          break;
        }
        node = walker.nextNode();
      }
      if (!textNode) {
        throw new Error(`Text node with "${args.target}" not found`);
      }

      const range = document.createRange();
      const start = textNode.textContent!.indexOf(args.target);
      range.setStart(textNode, start);
      range.setEnd(textNode, start + args.target.length);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      // Headless Chromium doesn't fire selectionchange on programmatic addRange.
      document.dispatchEvent(new Event("selectionchange"));
    },
    { flag: highlight_attrs.flag, target },
  );
}
