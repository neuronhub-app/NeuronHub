import { test } from "@playwright/test";

import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.locator();
    await play.dbStubsRepopulateAndLogin();
  });

  test("creation & vote", async ({ page }) => {
    // create a Comment
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    const commentContent = "Test comment";
    await play.fill(ids.comment.form.textarea, commentContent);
    await play.submit(ids.post.form);

    const vote = {
      up: $[ids.comment.vote.up],
      down: $[ids.comment.vote.down],
    };
    // test voting state
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
    await expect(page).toHaveText(commentContent);
  });

  test("editing", async ({ page }) => {
    // open a Review
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);

    // edit
    await play.click(ids.comment.edit.btn);
    const contentNew = "New comment content";
    await play.fill(ids.comment.form.textarea, contentNew);
    await play.submit(ids.post.form);
    // confirm
    await expect(page).toHaveText(contentNew);

    // reload → test persistence
    await play.reload({ idleWait: true });
    await expect(page).toHaveText(contentNew);
  });
});
