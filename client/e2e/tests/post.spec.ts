import { test } from "@playwright/test";

import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";
import { PostCategory } from "~/graphql/enums";

test.describe("Post", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("Create with a Tag and Category → edit .title", async ({ page }) => {
    await play.navigate(urls.posts.create);

    const post = {
      title: `Test Post ${Date.now()}`,
      tag: "TypeScript",
      category: PostCategory.Knowledge,
      titleUpdated: `Test Post ${Date.now()} 2`,
    };
    await play.fill(ids.post.form.title, post.title);
    const categoryBtn = $[`${ids.post.form.category}.${post.category}`];
    await categoryBtn.click();

    // Tag
    await play.addTag(post.tag);
    const vote = play.getTagVoteButtons(post.tag);
    await vote.up.click();
    await expect(vote.up).checked();
    await play.submit(ids.post.form);
    await expect(page).toHaveText(post.title);

    await play.navigate(urls.posts.knowledge, { idleWait: true });
    const card = play.getAll(ids.post.card.container).filter({ hasText: post.title });
    await expect(card).toBeVisible();
    await expect(card).toContainText(post.tag);

    // Edit
    await play.click(ids.post.card.link.edit);
    await expect($[ids.post.form.tags]).toHaveTag(post.tag);
    await expect(categoryBtn).checked();

    await play.fill(ids.post.form.title, post.titleUpdated);
    await play.submit(ids.post.form);
    await expect(page).toHaveText(post.titleUpdated);
  });
});
