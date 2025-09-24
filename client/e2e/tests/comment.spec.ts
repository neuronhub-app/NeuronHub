import { test } from "@playwright/test";

import { strs } from "@/components/posts/PostDetail/CommentForm";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let helper: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    $ = helper.locator();
    await helper.dbStubsRepopulateAndLogin();
  });

  test("creation & vote", async ({ page }) => {
    // create a Comment
    await helper.navigate(urls.reviews.list, { idleWait: true });
    await helper.click(ids.post.card.link.detail);
    const commentContent = "Test comment";
    await helper.fill(ids.comment.form.textarea, commentContent);
    await helper.click(ids.comment.form.submitBtn);
    await expect(page).toHaveText(strs.createdComment);

    const vote = {
      up: $[ids.comment.vote.up],
      down: $[ids.comment.vote.down],
    };
    // test voting state
    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await helper.click(ids.comment.vote.up);
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    await helper.click(ids.comment.vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    await helper.click(ids.comment.vote.down);
    await expect(vote.up).not.checked();
    await expect(vote.down).not.checked();

    await helper.click(ids.comment.vote.up);
    await expect(vote.up).checked();

    // reload → test persistence
    await helper.reload({ idleWait: true });
    await expect(vote.up).checked();
    await expect(page).toHaveText(commentContent);
  });

  test("editing", async ({ page }) => {
    // open a Review
    await helper.navigate(urls.reviews.list, { idleWait: true });
    await helper.click(ids.post.card.link.detail);

    // edit
    await helper.click(ids.comment.edit.btn);
    const contentNew = "New comment content";
    await helper.fill(ids.comment.form.textarea, contentNew);
    await helper.click(ids.comment.form.saveBtn);
    // confirm
    await expect(page).toHaveText(strs.updatedComment);
    await expect(page).toHaveText(contentNew);

    // reload → test persistence
    await helper.reload({ idleWait: true });
    await expect(page).toHaveText(contentNew);
  });
});
