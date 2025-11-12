import { test } from "@playwright/test";
import { highlighter } from "@/apps/highlighter/highlighter";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";
import { Visibility } from "~/graphql/enums";

test.describe("Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    const timeoutExtra = 7000; // the first E2E test (alphabetically this one) hits the cold Postgres cache & fails on timeout=4.5s
    play = new PlaywrightHelper(page, timeoutExtra);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: true,
    });
    $ = play.locator();
  });

  test("voting", async () => {
    // create
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);

    const commentContent = "Test comment";
    await play.fill(ids.comment.form.textarea, commentContent);
    await play.submit(ids.post.form);

    const vote = {
      up: $[ids.comment.vote.up],
      down: $[ids.comment.vote.down],
    };
    // test voting
    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await play.click(ids.comment.vote.up);
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    await play.click(ids.comment.vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    await play.click(ids.comment.vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await play.click(ids.comment.vote.up);
    await expect(vote.up).checked();

    // reload → test persistence
    await play.reload({ idleWait: true });
    await expect(vote.up).checked();
  });

  test("editing", async ({ page }) => {
    // open a Review
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);

    // edit first Comment
    await play.click(ids.comment.btn.edit);
    const contentNew = "New comment content";
    await play.fill(ids.comment.form.textareaEdit, contentNew);

    await $[ids.post.form.sharingFieldsToggle].check();
    await $[`visibility.${Visibility.Internal}`].click();

    await play.submit(ids.post.form);
    await expect(page).toHaveText(contentNew);

    // reload → test persistence
    await play.reload({ idleWait: true });
    await expect(page).toHaveText(contentNew);

    // verify visibility loads correctly from server
    await play.click(ids.comment.btn.edit);
    await $[ids.post.form.sharingFieldsToggle].check();
    await expect($[`visibility.${Visibility.Internal}`]).checked();

    // cancel editing
    await play.click(ids.comment.form.cancelBtn);
  });

  test("highlight", async ({ page }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    const comment = {
      highlighted: "highlight some text",
      highlightedCode: "important code",
      get content() {
        return `Test comment. We will ${this.highlighted}. Also test inline \`${this.highlightedCode}\` in backticks.`;
      },
    };
    await play.fill(ids.comment.form.textarea, comment.content);
    await play.submit(ids.post.form, { waitIdle: true });
    await expect(page.getByText(comment.highlighted)).toBeVisible();

    // select {comment.highlighted} with Selection API .addRange()
    // questionable #AI code. reviewed & cleaned, but looks as shit.
    // todo refac: move out
    await page.evaluate(
      ctx => {
        const elsHighlightable = document.querySelectorAll(`[data-${ctx.attrs.flag}]`);

        let commentEl: Element | null = null;
        for (const el of elsHighlightable) {
          if (el.textContent?.includes(ctx.comment.highlighted)) {
            commentEl = el;
            break;
          }
        }
        const walker = document.createTreeWalker(commentEl!, NodeFilter.SHOW_TEXT, {
          acceptNode: (node: Node) => {
            const isEmptyNode = !node.textContent || !node.textContent.trim();
            if (isEmptyNode) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        });

        let nodeFound: Node | null = null;
        // Walk through all text nodes to find the one containing our text
        let nodeText = walker.nextNode();
        while (nodeText !== null) {
          if (nodeText.textContent?.includes(ctx.comment.highlighted)) {
            nodeFound = nodeText;
            break;
          }
          nodeText = walker.nextNode();
        }
        if (!nodeFound) throw Error();

        const range = document.createRange();
        const startOffset = nodeFound.textContent!.indexOf(ctx.comment.highlighted);
        range.setStart(nodeFound, startOffset);
        range.setEnd(nodeFound, startOffset + ctx.comment.highlighted.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      },
      { attrs: highlighter.attrs, comment },
    );

    await expect($[ids.highlighter.btn.save]).toBeVisible();
    await $[ids.highlighter.btn.save].click();
    await play.waitForNetworkIdle();

    // test PostHighlight visibility wo/ a reload
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(comment.highlighted);

    // test PostHighlight visibility after a reload
    await play.reload({ idleWait: true });
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(comment.highlighted);

    // test PostHighlight delete
    await $[ids.highlighter.span].click();
    await expect($[ids.highlighter.btn.delete]).toBeVisible();
    await $[ids.highlighter.btn.delete].click();
    await play.reload({ idleWait: true });
    await expect($[ids.highlighter.span]).not.toBeAttached();

    // #AI-slop
    // Test 2: Highlight text in code blocks
    // await play.fill(
    //   ids.comment.form.textarea,
    //   `Test inline code: \`${comment.highlightedCode}\` here.`,
    // );
    // await play.submit(ids.post.form);
    // await play.waitForNetworkIdle();
    //
    // // Select text inside code block
    // await page.evaluate(
    //   ctx => {
    //     const codeElement = document.querySelector("code");
    //     if (!codeElement) throw new Error("Code element not found");
    //
    //     const textNode = Array.from(codeElement.childNodes).find(
    //       node =>
    //         node.nodeType === Node.TEXT_NODE && node.textContent?.includes(ctx.highlightedCode),
    //     );
    //     if (!textNode) throw new Error("Text in code not found");
    //
    //     const range = document.createRange();
    //     const startOffset = textNode.textContent!.indexOf(ctx.highlightedCode);
    //     range.setStart(textNode, startOffset);
    //     range.setEnd(textNode, startOffset + ctx.highlightedCode.length);
    //
    //     const selection = window.getSelection();
    //     selection?.removeAllRanges();
    //     selection?.addRange(range);
    //   },
    //   { highlightedCode: comment.highlightedCode },
    // );
    //
    // await expect($[ids.highlighter.btn.save]).toBeVisible();
    // await $[ids.highlighter.btn.save].click();
    // await play.waitForNetworkIdle();
    //
    // // Reload and verify highlight in code block renders correctly (not escaped)
    // await play.reload({ idleWait: true });
    // const highlightSpans = await page.locator(`[data-testid="${ids.highlighter.span}"]`).all();
    // expect(highlightSpans.length).toBeGreaterThan(0);
    //
    // // Verify at least one highlight is in a code block
    // const isInCodeBlock = await page.evaluate(() => {
    //   const highlights = document.querySelectorAll(`[data-testid="highlighter.span"]`);
    //   return Array.from(highlights).some(h => h.closest("code") !== null);
    // });
    // expect(isInCodeBlock).toBe(true);
  });
});
