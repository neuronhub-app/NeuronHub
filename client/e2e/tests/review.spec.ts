import { expect, test } from "@playwright/test";
import { PostReviewForm } from "@/apps/reviews/create/PostReviewForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Review", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create with Parent", async ({ page }) => {
    await page.goto(urls.reviews.create);

    await helper.fill(ids.postTool.form.title, "Django");
    await helper.fill(ids.review.form.title, "Django Review");
    await helper.fill(ids.review.form.content, "Easy to build with");
    await helper.click(ids.post.btn.submit);

    await helper.expectText(PostReviewForm.strs.reviewCreated);
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

  test("Tags editing and voting", async ({ page }) => {
    await page.goto(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    const tagsContainer = helper.get(ids.review.form.tags);
    const tagName = {
      existing: "Terminal emulator",
      added: "New tag",
    };
    await expect(tagsContainer).toContainText(tagName.existing);

    // upvote `tagName.existing` #AI
    await tagsContainer
      .locator(`[data-name="${tagName.existing}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.up)
      .click();

    // Add new tag
    const input = tagsContainer.locator("input").first();
    await input.click();
    await input.pressSequentially(tagName.added, { delay: 100 });
    await page.keyboard.press("Enter");
    await expect(tagsContainer).toContainText(tagName.added);
    await helper.click(ids.post.btn.submit);
    await helper.expectText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();

    // Re-edit to verify persistence
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);
    const tagsUpdated = helper.get(ids.review.form.tags);
    await expect(tagsUpdated).toContainText(tagName.existing);
    await expect(tagsUpdated).toContainText(tagName.added);

    const voteButton = tagsUpdated
      .locator(`[data-name="${tagName.existing}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.up);

    await expect(voteButton).toHaveAttribute("data-is-vote-positive", "true");
  });
});
