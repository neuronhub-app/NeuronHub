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

  test("Create with multiple content types", async ({ page }) => {
    await play.navigate(urls.posts.create);

    const post = {
      title: `Multi-content Post ${Date.now()}`,
      content_polite: "This library provides excellent functionality for state management.",
      content_direct: "The docs are weak and the API is inconsistent in places.",
      content_rant: "Why did they change the API again?! This is the third breaking change!",
    };

    await play.fill(ids.post.form.title, post.title);

    // Fill polite content (should be open by default)
    await play.fill(ids.post.form.content_polite, post.content_polite);

    // Open and fill direct content
    await $[ids.post.card.content_direct].click();
    await play.fill(ids.post.form.content_direct, post.content_direct);

    // Open and fill rant content
    await $[ids.post.card.content_rant].click();
    await play.fill(ids.post.form.content_rant, post.content_rant);

    await play.submit(ids.post.form);

    // Verify all content is displayed (polite should be visible by default)
    await expect(page).toHaveText(post.content_polite);

    // Check other content panels can be opened
    await $[ids.post.card.content_direct].click();
    await expect(page).toHaveText(post.content_direct);

    await $[ids.post.card.content_rant].click();
    await expect(page).toHaveText(post.content_rant);
  });

  test("Create with a Tag and Category → edit .title", async ({ page }) => {
    await play.navigate(urls.posts.create);

    const post = {
      title: `Test Post ${Date.now()}`,
      content: "This is test content for the post",
      tag: "TypeScript",
      category: PostCategory.Knowledge,
      titleUpdated: `Test Post ${Date.now()} 2`,
    };
    await play.fill(ids.post.form.title, post.title);

    // Fill content - the accordion should be open by default for content_polite
    await play.fill(ids.post.form.content_polite, post.content);

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

    await expect(vote.up).checked();

    await play.fill(ids.post.form.title, post.titleUpdated);
    await play.submit(ids.post.form);
    await expect(page).toHaveText(post.titleUpdated);
  });
});
