import type { Locator } from "@playwright/test";
import { highlight_attrs } from "@/apps/highlighter/PostContentHighlighted";
import {
  HighlightCreate,
  HighlightDelete,
  PostHighlightsQuery,
} from "@/apps/highlighter/useHighlighter";
import { UserQueryDoc } from "@/apps/users/useUserCurrent";
import { expect } from "@/e2e/helpers/expect";
import type { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { selectTextHighlightable } from "@/e2e/helpers/selectTextInPage";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";
import { Visibility } from "~/graphql/enums";

const tool = "PyCharm";
const review = "Fine review";

test.describe("Comments", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      { posts_tool: { title: tool } },
      { posts_review: { parent: tool, title: review } },
      { posts_comment: { parent_root: review, content_polite: "Seeded comment" } },
    ]);
  });

  test("voting", async ({ play, $ }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    const vote = {
      up: $[ids.comment.vote.up],
      down: $[ids.comment.vote.down],
    };

    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await voteAndWait(play, vote.up);
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    await voteAndWait(play, vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    await voteAndWait(play, vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await voteAndWait(play, vote.up);
    await expect(vote.up).checked();

    await play.reload({ idleWait: true });
    await expect(vote.up).checked();
  });

  test("editing", async ({ page, play, $ }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

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

  test("highlight: create, persist, delete", async ({ page, play, $ }) => {
    const textHighlighted = "highlight some text";
    const commentContent = `Test comment. We will ${textHighlighted}. Trailing words.`;

    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);

    await play.fill(ids.comment.form.textarea, commentContent);
    await play.submit(ids.post.form);

    // Wait for the new comment's highlightable Prose to render before selecting text.
    const commentProse = page
      .locator(`[data-${highlight_attrs.flag}]`)
      .filter({ hasText: textHighlighted })
      .first();
    await expect(commentProse).toBeVisible();

    await selectTextHighlightable(page, textHighlighted);

    await expect($[ids.highlighter.btn.save]).toBeVisible();
    const created = play.waitForResponseGraphql(HighlightCreate);
    await $[ids.highlighter.btn.save].click();
    await created;

    // optimistic <mark> via highlightsMap
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(textHighlighted);

    // persistence after reload
    await play.reload({ idleWait: true });
    await expect($[ids.highlighter.span]).toBeVisible();
    await expect($[ids.highlighter.span]).toHaveText(textHighlighted);

    // delete
    await $[ids.highlighter.span].click();
    await expect($[ids.highlighter.btn.delete]).toBeVisible();
    const deleted = play.waitForResponseGraphql(HighlightDelete);
    await $[ids.highlighter.btn.delete].click();
    await deleted;

    const highlightsLoaded = play.waitForResponseGraphql(PostHighlightsQuery);
    await play.reload();
    await highlightsLoaded;
    await expect($[ids.highlighter.span]).not.toBeAttached();
  });
});

async function voteAndWait(play: PlaywrightHelper, button: Locator) {
  const userRefetch = play.waitForResponseGraphql(UserQueryDoc);
  await button.click();
  await userRefetch;
}
