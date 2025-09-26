import { test } from "@playwright/test";
import { PostReviewForm } from "@/apps/reviews/create/PostReviewForm";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Review", () => {
  let helper: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
    $ = helper.locator();
  });

  test("Create with a Parent", async ({ page }) => {
    await helper.navigate(urls.reviews.create, { idleWait: true });

    await helper.fill(ids.post.form.title, "Django");
    await helper.fill(ids.review.form.title, "Django Review");
    await helper.fill(ids.review.form.content, "Easy to build with");
    await helper.click(ids.post.btn.submit);

    await expect(page).toHaveText(PostReviewForm.strs.reviewCreated);
  });

  test("Edit Review.tags & Tool.tags", async () => {
    await helper.navigate(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);

    const tags = {
      parent: { existing: "IDE" },
      review: { existing: "Python", new: "FastAPI" },
    };

    const reviewTags = $[ids.review.form.tags];
    await expect(reviewTags).toHaveTag(tags.review.existing);
    const toolTags = $[ids.post.form.tags];
    await expect(toolTags).toHaveTag(tags.parent.existing);

    // Add
    await helper.addTag(tags.review.new, { isReviewTag: true });
    await submitAndReload();
    await expect(reviewTags).toHaveTag(tags.review.new);

    // todo refac: use ids - ie make "remove" btn a child of ids.review.form.tags
    await reviewTags.locator(`[aria-label="Remove ${tags.review.new}"]`).click();
    await submitAndReload();
    await expect(reviewTags).not.toHaveTag(tags.review.new);
    await expect(toolTags).toHaveTag(tags.review.new);
  });

  test("Tag (existing) voting & add a Tag", async () => {
    await helper.navigate(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);

    const tags = { existing: "Django", new: "New tag" };
    const vote = helper.getTagVoteButtons(tags.existing, { isReviewTag: true });

    // initial check
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    // downvote
    await vote.down.click();
    await submitAndReload();
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    // add new
    await helper.addTag(tags.new, { isReviewTag: true });
    await submitAndReload();
    await expect($[ids.review.form.tags]).toHaveTag(tags.existing);
    await expect($[ids.review.form.tags]).toHaveTag(tags.new);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();
  });

  async function submitAndReload() {
    await helper.click(ids.post.btn.submit);
    await expect(helper.page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.page.waitForLoadState("networkidle");
    await helper.click(ids.post.card.link.edit);
  }
});
