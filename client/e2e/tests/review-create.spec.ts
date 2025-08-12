import { expect, test } from "@playwright/test";
import { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";

test.describe("Review create", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("Create with 2 fields", async ({ page }) => {
    await page.goto(`${config.client.url}/reviews/create`);
    await expect(pwh.get(ids.review.form.parentTitle)).toBeVisible();

    await pwh.get(ids.review.form.parentTitle).fill("Django");
    await pwh.get(ids.review.form.contentTextarea).fill("Easy to build with");
    await pwh.click(ids.post.btn.submit);

    await pwh.waitForText(ReviewCreateForm.strs.reviewCreated);
  });
});
