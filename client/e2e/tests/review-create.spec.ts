import { expect, test } from "@playwright/test";
import { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Review create form", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbStubsRepopulateAndLogin();
  });

  test("Create with 2 fields", async ({ page }) => {
    await page.goto(urls.reviews.create);
    await expect(pwh.get(ids.review.form.parentTitle)).toBeVisible();

    await pwh.get(ids.review.form.parentTitle).fill("Django");
    await pwh.get(ids.review.form.contentTextarea).fill("Easy to build with");
    await pwh.click(ids.post.btn.submit);

    await pwh.waitForText(ReviewCreateForm.strs.reviewCreated);
  });
});
