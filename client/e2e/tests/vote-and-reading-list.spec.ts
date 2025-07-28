import { expect, type Page, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Post button actions", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("Upvote", async ({ page }) => {
    await openReviewsAndVerifyToggle(page, ids.post.vote.up);
  });

  test("Add to Reading List", async ({ page }) => {
    await openReviewsAndVerifyToggle(page, ids.post.btn.readingList);
  });

  async function openReviewsAndVerifyToggle(page: Page, btnId: string) {
    await pwh.navigate(urls.reviews.$);

    await expect(pwh.get(btnId)).toBeVisible();

    await pwh.waitForState(btnId, "unchecked");

    // mutate
    const waitForUpdate = page.waitForResponse(`${config.server.apiUrl}?query=UserCurrent`);
    await pwh.get(btnId).click();
    await waitForUpdate;
    await pwh.waitForState(btnId, "checked");

    await page.reload();
    await pwh.waitForState(btnId, "checked");
  }
});
