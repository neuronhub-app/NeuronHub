import { type Page, test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post button actions", () => {
  let pwh: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlaywrightHelper(page);
    await pwh.dbStubsRepopulateAndLogin();
  });

  test("Upvote", async ({ page }) => {
    await openReviewsAndVerifyToggle(page, ids.post.vote.up);
  });

  test("Add to Reading List", async ({ page }) => {
    await openReviewsAndVerifyToggle(page, ids.post.btn.readingList);
  });

  async function openReviewsAndVerifyToggle(page: Page, btnId: string) {
    await pwh.navigate(urls.reviews.list);

    await expect(pwh.get(btnId)).toBeVisible();

    await expect(page).toHaveChecked(btnId, false);

    // mutate
    const waitForUpdate = page.waitForResponse(response =>
      response.url().includes("UserCurrent"),
    );
    await pwh.click(btnId);
    await waitForUpdate;
    await expect(page).toHaveChecked(btnId, true);

    await page.reload();
    await expect(page).toHaveChecked(btnId, true);
  }
});
