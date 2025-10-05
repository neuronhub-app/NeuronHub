import { test } from "@playwright/test";

import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("Create with a Tag → edit .title", async ({ page }) => {
    await play.navigate(urls.posts.create);

    const post = { title: `Test Post ${Date.now()}`, tag: "TypeScript" };
    await play.fill(ids.post.form.title, post.title);
    await play.addTag(post.tag);
    // Vote on Tag
    const vote = play.getTagVoteButtons(post.tag);
    await vote.up.click();
    await expect(vote.up).checked();
    await play.submit(ids.post.form);
    await expect(page).toHaveText(post.title);

    // Verify in list
    await play.navigate(urls.posts.list, { idleWait: true });
    const card = play.getAll(ids.post.card.container).filter({ hasText: post.title });
    await expect(card).toContainText(post.tag);

    // Edit
    await play.click(ids.post.card.link.edit);
    await expect($[ids.post.form.tags]).toHaveTag(post.tag);
    const titleUpdated = `${post.title} edited`;
    await play.fill(ids.post.form.title, titleUpdated);
    await play.submit(ids.post.form);
    await expect(page).toHaveText(titleUpdated);
  });
});
