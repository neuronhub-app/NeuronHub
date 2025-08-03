import { expect, test } from "@playwright/test";
import { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";

test.describe("Review create", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbResetAndLogin();
  });

  test("Create with 2 fields", async ({ page }) => {
    await page.goto(`${config.client.url}/reviews/create`);
    await expect(page.getByTestId(ids.review.form.parentNameInput)).toBeVisible();

    await page.getByTestId(ids.review.form.parentNameInput).fill("Django");
    await page.getByTestId(ids.review.form.contentTextarea).fill("Easy to build with");
    await helper.click(ids.post.btn.submit);

    await helper.waitForText(ReviewCreateForm.strs.reviewCreated);
  });
});
