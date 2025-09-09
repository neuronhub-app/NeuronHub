import { test } from "@playwright/test";

import { PostCreateForm } from "@/apps/posts/create/PostCreateForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post Create", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create Post with tags and verify on list", async ({ page }) => {
    await page.goto(urls.posts.create);
    await helper.waitForNetworkIdle();

    const testTitle = `Test Post ${Date.now()}`;

    // Fill basic fields
    await helper.fill(ids.post.form.title, testTitle);

    // Add tags
    const tagsContainer = helper.get(ids.post.form.tags.container);
    const tagInput = tagsContainer.locator("input").first();

    const tagName = "Python";
    await tagInput.click();
    await tagInput.pressSequentially(tagName, { delay: 100 });
    await page.keyboard.press("Enter");
    await expect(tagsContainer).toContainText(tagName);

    // Vote on the tag
    const voteUpButton = tagsContainer
      .locator(`[data-name="${tagName}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.up);
    await voteUpButton.click();
    await expect(voteUpButton).toHaveAttribute("data-is-active", "true");

    // Submit the form
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostCreateForm.strs.postCreated);

    // Navigate to posts list to verify
    await page.goto(urls.posts.list);
    await helper.waitForNetworkIdle();

    // Find the created post by title
    const postCard = page
      .locator(`[data-testid="${ids.post.card.container}"]`)
      .filter({ hasText: testTitle });
    await expect(postCard).toBeVisible();

    // Verify tag is displayed on the post
    await expect(postCard).toContainText(tagName);
  });
});
