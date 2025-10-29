import { test } from "@playwright/test";
import { highlighter } from "@/apps/highlighter/highlighter";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    const timeoutExtra = 7000; // in E2E the first test (alphabetically) hits cold postgres & timeout on default 4.5s
    play = new PlaywrightHelper(page, timeoutExtra);
    await play.dbStubsRepopulateAndLogin();
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

    // edit
    await play.click(ids.comment.btn.edit);
    const contentNew = "New comment content";
    await play.fill(ids.comment.form.textarea, contentNew);
    await play.submit(ids.post.form);
    // confirm
    await expect(page).toHaveText(contentNew);

    // reload → test persistence
    await play.reload({ idleWait: true });
    await expect(page).toHaveText(contentNew);
  });

  test("highlight", async ({ page }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    // Test both regular text and code blocks in one comment
    const comment = {
      highlighted: "highlight some text",
      highlightedCode: "important code",
      get content() {
        return `Test comment. We will ${this.highlighted}. Also test inline \`${this.highlightedCode}\` in backticks.`;
      },
    };
    await play.screenshot();
    await play.fill(ids.comment.form.textarea, comment.content);
    await play.submit(ids.post.form);
    await play.waitForNetworkIdle();
    await expect(page.getByText(comment.highlighted)).toBeVisible();

    const commentId = await page.evaluate(attrs => {
      const commentEl = document.querySelector(`[data-${attrs.flag}="true"]`);
      if (!commentEl) throw new Error();
      return commentEl.getAttribute(`data-${attrs.id}`);
    }, highlighter.attrs);

    // test create
    await page.evaluate(
      ctx => {
        const commentEl = document.querySelector(`[data-${ctx.attrs.flag}="true"]`);
        if (!commentEl) throw new Error();

        const textNode = Array.from(commentEl.querySelectorAll("*"))
          .flatMap(el => Array.from(el.childNodes))
          .find(
            node =>
              node.nodeType === Node.TEXT_NODE &&
              node.textContent?.includes(ctx.comment.highlighted),
          );
        if (!textNode) throw new Error("Text node not found");

        const range = document.createRange();
        const startOffset = textNode.textContent!.indexOf(ctx.comment.highlighted);
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, startOffset + ctx.comment.highlighted.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      },
      { attrs: highlighter.attrs, comment },
    );

    await expect($[ids.highlighter.btn.save]).toBeVisible();
    await $[ids.highlighter.btn.save].click();

    // test selection clearing
    const hasSelection = await page.evaluate(() => {
      const selection = window.getSelection();
      return selection && selection.toString().length > 0;
    });
    expect(hasSelection).toBe(false);

    // test highlight save
    const highlight = await play.graphqlQuery(
      graphql(`
        query GetHighlights($ids: [ID!]!) {
          post_highlights(post_ids: $ids) { id post { id } text text_prefix text_postfix }
        }
      `),
      { ids: [commentId!] },
    );
    expect(highlight.data).toBeDefined();
    expect(highlight.data.post_highlights).toHaveLength(1);
    expect(highlight.data.post_highlights[0].text).toBe(comment.highlighted);
    expect(highlight.data.post_highlights[0].post?.id).toBe(commentId);

    // test visible wo/ a reload
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(comment.highlighted);

    // test reload
    await play.reload({ idleWait: true });
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(comment.highlighted);

    // test delete
    await $[ids.highlighter.span].click();
    await expect($[ids.highlighter.btn.delete]).toBeVisible();
    await $[ids.highlighter.btn.delete].click();
    await play.reload({ idleWait: true });
    await expect($[ids.highlighter.span]).not.toBeAttached();

    // Test 2: Highlight text in code blocks
    await play.fill(
      ids.comment.form.textarea,
      `Test inline code: \`${comment.highlightedCode}\` here.`,
    );
    await play.submit(ids.post.form);
    await play.waitForNetworkIdle();

    // Select text inside code block
    await page.evaluate(
      ctx => {
        const codeElement = document.querySelector("code");
        if (!codeElement) throw new Error("Code element not found");

        const textNode = Array.from(codeElement.childNodes).find(
          node =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.includes(ctx.highlightedCode),
        );
        if (!textNode) throw new Error("Text in code not found");

        const range = document.createRange();
        const startOffset = textNode.textContent!.indexOf(ctx.highlightedCode);
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, startOffset + ctx.highlightedCode.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      },
      { highlightedCode: comment.highlightedCode },
    );

    await expect($[ids.highlighter.btn.save]).toBeVisible();
    await $[ids.highlighter.btn.save].click();
    await play.waitForNetworkIdle();

    // Reload and verify highlight in code block renders correctly (not escaped)
    await play.reload({ idleWait: true });
    const highlightSpans = await page.locator(`[data-testid="${ids.highlighter.span}"]`).all();
    expect(highlightSpans.length).toBeGreaterThan(0);

    // Verify at least one highlight is in a code block
    const isInCodeBlock = await page.evaluate(() => {
      const highlights = document.querySelectorAll(`[data-testid="highlighter.span"]`);
      return Array.from(highlights).some(h => h.closest("code") !== null);
    });
    expect(isInCodeBlock).toBe(true);
  });
});
