import { test } from "@playwright/test";

import { PostCreateForm } from "@/apps/posts/create/PostCreateForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
  });

  test("Create with tags", async ({ page }) => {
    await play.navigate(urls.posts.create);

    const post = { title: `Test Post ${Date.now()}`, tag: "TypeScript" };
    await play.fill(ids.post.form.title, post.title);
    await play.addTag(post.tag);
    // Vote on Tag
    const vote = play.getTagVoteButtons(post.tag);
    await vote.up.click();
    await expect(vote.up).checked();
    await play.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostCreateForm.strs.postCreated);
    await expect(page).toHaveText(post.title);

    // Verify in list
    await play.navigate(urls.posts.list, { idleWait: true });
    const card = play.getAll(ids.post.card.container).filter({ hasText: post.title });
    await expect(card).toContainText(post.tag);
  });
});
