import { test } from "@playwright/test";

import { strs } from "@/components/posts/PostDetail/CommentForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("create comment and vote", async ({ page }) => {
    // test creation
    await helper.navigate(urls.reviews.list);
    await helper.waitForNetworkIdle();
    await helper.click(ids.post.card.link.detail);
    await helper.wait(ids.comment.form.textarea);
    const commentContent = "Test comment";
    await helper.fill(ids.comment.form.textarea, commentContent);
    await helper.click(ids.comment.form.submitBtn);

    await expect(page).toHaveText(strs.createdComment);

    // test voting
    await expect(page).toHaveChecked(ids.comment.vote.up, false);
    await expect(page).toHaveChecked(ids.comment.vote.down, false);

    await helper.click(ids.comment.vote.up);
    await expect(page).toHaveChecked(ids.comment.vote.up, true);
    await expect(page).toHaveChecked(ids.comment.vote.down, false);

    await helper.click(ids.comment.vote.down);
    await expect(page).toHaveChecked(ids.comment.vote.down, true);
    await expect(page).toHaveChecked(ids.comment.vote.up, false);

    await helper.click(ids.comment.vote.down);
    await expect(page).toHaveChecked(ids.comment.vote.down, false);
    await expect(page).toHaveChecked(ids.comment.vote.up, false);

    await helper.click(ids.comment.vote.up);
    await expect(page).toHaveChecked(ids.comment.vote.up, true);

    // reload to verify persistence
    await page.reload();
    await helper.waitForNetworkIdle();
    await expect(page).toHaveChecked(ids.comment.vote.up, true);
    await expect(page).toHaveText(commentContent);
  });

  test("edit comment", async ({ page }) => {
    // open a Review
    await helper.navigate(urls.reviews.list);
    await helper.waitForNetworkIdle();
    await helper.click(ids.post.card.link.detail);

    // edit
    await helper.click(ids.comment.edit.btn);
    await helper.wait(ids.comment.form.textarea);
    const contentUpdated = "Updated comment content";
    await helper.get(ids.comment.form.textarea).clear();
    await helper.fill(ids.comment.form.textarea, contentUpdated);
    // save
    await helper.click(ids.comment.form.saveBtn);
    await expect(page).toHaveText(strs.updatedComment);
    await expect(page).toHaveText(contentUpdated);

    // reload to verify persistence
    await page.reload();
    await helper.waitForNetworkIdle();
    await expect(page).toHaveText(contentUpdated);
  });
});
