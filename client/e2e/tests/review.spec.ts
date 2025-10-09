import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Review", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("Create with a Parent", async () => {
    await play.navigate(urls.reviews.create, { idleWait: true });

    await play.fill(ids.post.form.title, "Django");
    await play.fill(ids.review.form.title, "Django Review");
    await play.fill(ids.post.form.content_polite, "Easy to build with");
    await play.submit(ids.post.form);
  });

  test("Edit Review.tags & Tool.tags", async () => {
    await play.navigate(urls.reviews.list);
    await play.click(ids.post.card.link.edit);

    const tags = {
      parent: { existing: "IDE" },
      review: { existing: "Python", new: "FastAPI" },
    };

    const reviewTags = $[ids.review.form.tags];
    await expect(reviewTags).toHaveTag(tags.review.existing);
    const toolTags = $[ids.post.form.tags];
    await expect(toolTags).toHaveTag(tags.parent.existing);

    // Add
    await play.addTag(tags.review.new, { isReviewTag: true });
    await submitAndReload();
    await expect(reviewTags).toHaveTag(tags.review.new);

    // todo refac: use ids - ie make "remove" btn a child of ids.review.form.tags
    await reviewTags.locator(`[aria-label="Remove ${tags.review.new}"]`).click();
    await submitAndReload();
    await expect(reviewTags).not.toHaveTag(tags.review.new);
    await expect(toolTags).toHaveTag(tags.review.new);
  });

  test("Tag (existing) voting & add a Tag", async () => {
    await play.navigate(urls.reviews.list);
    await play.click(ids.post.card.link.edit);

    const tags = { existing: "Django", new: "New tag" };
    const vote = play.getTagVoteButtons(tags.existing, { isReviewTag: true });

    // initial check
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    // downvote
    await vote.down.click();
    await submitAndReload();
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    // add new
    await play.addTag(tags.new, { isReviewTag: true });
    await submitAndReload();
    await expect($[ids.review.form.tags]).toHaveTag(tags.existing);
    await expect($[ids.review.form.tags]).toHaveTag(tags.new);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();
  });

  async function submitAndReload() {
    await play.submit(ids.post.form);
    await play.page.waitForLoadState("networkidle");
    await play.click(ids.post.card.link.edit);
  }
});
