import { test } from "@playwright/test";

import { PostCreateForm } from "@/apps/posts/create/PostCreateForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create with tags", async ({ page }) => {
    await helper.navigate(urls.posts.create);

    const title = `Test Post ${Date.now()}`;
    await helper.fill(ids.post.form.title, title);

    const tag = "Python";
    await helper.addTag(tag);

    // Vote on the tag
    const vote = helper.getTagVoteButtons(tag);
    await vote.up.click();
    await expect(vote.up).checked();
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostCreateForm.strs.postCreated);

    // Verify in list
    await helper.navigate(urls.posts.list, { idleWait: true });
    const postCard = helper.getAll(ids.post.card.container).filter({ hasText: title });
    await expect(postCard).toBeVisible();
    await expect(postCard).toContainText(tag);
  });
});
