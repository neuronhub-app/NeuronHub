import { expect, test } from "@playwright/test";
import { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Review", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Edit twice", async ({ page }) => {
    // review edit #1

    await page.goto(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);

    const titleUpdated = "Updated title";
    const contentUpdated = "Updated content";
    await helper.fill(ids.review.form.content, contentUpdated);
    await helper.fill(ids.review.form.title, titleUpdated);

    await helper.click(ids.post.btn.submit);
    const reviewId = await helper.get(ids.post.card.container).getAttribute("data-id");
    await page.waitForURL(urls.reviews.detail(reviewId!));
    await helper.expectText(contentUpdated);
    await helper.expectText(titleUpdated);

    // review edit #2

    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.content);
    await expect(helper.get(ids.review.form.content)).toHaveValue(contentUpdated);

    const contentUpdated2 = `${contentUpdated} #2`;
    await helper.fill(ids.review.form.content, contentUpdated2);
    await helper.click(ids.post.btn.submit);

    await page.waitForURL(urls.reviews.detail(reviewId!));
    await helper.expectText(contentUpdated2);
  });

  test("Create with Parent", async ({ page }) => {
    await page.goto(urls.reviews.create);

    await helper.fill(ids.review.form.parentTitle, "Django");
    await helper.fill(ids.review.form.content, "Easy to build with");
    await helper.click(ids.post.btn.submit);

    await helper.expectText(ReviewCreateForm.strs.reviewCreated);
  });
});
