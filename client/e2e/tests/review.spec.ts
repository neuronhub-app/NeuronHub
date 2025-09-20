import { test } from "@playwright/test";
import { PostReviewForm } from "@/apps/reviews/create/PostReviewForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Review", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create with Parent", async ({ page }) => {
    await page.goto(urls.reviews.create);
    await helper.waitForNetworkIdle();

    await helper.fill(ids.post.form.title, "Django");
    await helper.fill(ids.review.form.title, "Django Review");
    await helper.fill(ids.review.form.content, "Easy to build with");
    await helper.click(ids.post.btn.submit);

    await expect(page).toHaveText(PostReviewForm.strs.reviewCreated);
  });

  // #AI duplicates test below, low quality, refactor
  test("Tags review.tags", async ({ page }) => {
    await page.goto(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    const tagsReviewContainer = helper.get(ids.review.form.tags);
    const tagName = {
      existing: "Django",
      added: "New tag",
    };
    await expect(tagsReviewContainer).toContainText(tagName.existing);

    // Verify initial state
    const voteUpButton = tagsReviewContainer
      .locator(`[data-name="${tagName.existing}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.up);
    const voteDownButton = tagsReviewContainer
      .locator(`[data-name="${tagName.existing}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.down);
    await expect(voteUpButton).toHaveAttribute("data-is-active", "true");
    await expect(voteDownButton).toHaveAttribute("data-is-active", "false");

    // Click downvote on upvoted
    await voteDownButton.click();
    await expect(voteUpButton).toHaveAttribute("data-is-active", "false");
    await expect(voteDownButton).toHaveAttribute("data-is-active", "true");
    // Save
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();
    // Re-open the form
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    // Verify downvote persisted
    await expect(voteUpButton).toHaveAttribute("data-is-active", "false");
    await expect(voteDownButton).toHaveAttribute("data-is-active", "true");

    // Try to change back to upvote
    await voteUpButton.click();
    await expect(voteUpButton).toHaveAttribute("data-is-active", "true");
    await expect(voteDownButton).toHaveAttribute("data-is-active", "false");

    // Add tagName.added
    const input = tagsReviewContainer.locator("input").first();
    await input.click();
    await input.pressSequentially(tagName.added, { delay: 100 });
    await page.keyboard.press("Enter");
    await expect(tagsReviewContainer).toContainText(tagName.added);
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();

    // Re-open the form
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);
    await expect(tagsReviewContainer).toContainText(tagName.existing);
    await expect(tagsReviewContainer).toContainText(tagName.added);

    const voteButton = tagsReviewContainer
      .locator(`[data-name="${tagName.existing}"]`)
      .getByTestId(ids.post.form.tags.tag.vote.up);
    await expect(voteButton).toHaveAttribute("data-is-vote-positive", "true");
  });

  test("tags and review_tags editing", async ({ page }) => {
    // #AI
    await page.goto(urls.reviews.list);
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    const reviewTagsContainer = helper.get(ids.review.form.tags);
    const toolTagsContainer = helper.get(ids.post.form.tags.container);

    const tags = {
      parent: {
        existing: "IDE",
      },
      review: {
        existing: "Python",
        new: "FastAPI",
      },
    };
    await expect(reviewTagsContainer).toContainText(tags.review.existing, {
      useInnerText: true,
    });
    await expect(toolTagsContainer).toContainText(tags.parent.existing);

    // Add a new tag to review.tags
    const tagInput = reviewTagsContainer.locator("input").first();
    await tagInput.click();
    await tagInput.pressSequentially(tags.review.new, { delay: 100 });
    await page.keyboard.press("Enter");
    await expect(reviewTagsContainer).toContainText(tags.review.new);

    // Save review
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();

    // Re-edit to verify tag persistence
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    // Verify tags are in review.tags
    await expect(reviewTagsContainer).toContainText(tags.review.existing);
    await expect(reviewTagsContainer).toContainText(tags.review.new);

    // Test removing a tag from review.tags - it should then appear in parent.tags
    const removeButton = reviewTagsContainer.locator(`[aria-label="Remove ${tags.review.new}"]`);
    await removeButton.click();

    // Verify tag is removed from review.tags input
    await expect(reviewTagsContainer).not.toContainText(tags.review.new);

    // The removed tag should now appear in parent.tags (no longer hidden since not in review.tags)
    await expect(toolTagsContainer).toContainText(tags.review.new);

    // Save and verify persistence of removal
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();

    // Re-edit to verify removal persisted
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);
    await expect(reviewTagsContainer).not.toContainText(tags.review.new);
    await expect(reviewTagsContainer).toContainText(tags.review.existing);
    await expect(toolTagsContainer).toContainText(tags.review.new);
  });

  // #AI
  test("tags votes persist after save without changes", async ({ page }) => {
    // Load review list page and verify tags with votes are visible initially
    await page.goto(urls.reviews.list);
    await helper.waitForNetworkIdle();

    // Find first review card (from db stubs)
    const firstCard = helper.get(ids.post.card.container).first();

    // Look for upvote/downvote icons on tags (these indicate author votes)
    const upvoteIcons = firstCard.locator('[aria-label="upvote"]');
    const downvoteIcons = firstCard.locator('[aria-label="downvote"]');

    // Should have at least one vote icon initially (from stub data)
    const initialUpvoteCount = await upvoteIcons.count();
    const initialDownvoteCount = await downvoteIcons.count();
    const totalInitialVotes = initialUpvoteCount + initialDownvoteCount;
    expect(totalInitialVotes).toBeGreaterThan(0);

    // Open edit form for first review
    await helper.click(ids.post.card.link.edit);
    await helper.wait(ids.review.form.title);

    // Save without any changes
    await helper.click(ids.post.btn.submit);
    await expect(page).toHaveText(PostReviewForm.strs.reviewUpdated);
    await helper.waitForNetworkIdle();

    // Go back to review list
    await page.goto(urls.reviews.list);
    await helper.waitForNetworkIdle();

    // Bug: vote indicators should still be visible but they disappear after save
    const upvoteIconsAfter = firstCard.locator('[aria-label="upvote"]');
    const downvoteIconsAfter = firstCard.locator('[aria-label="downvote"]');
    const totalVotesAfter =
      (await upvoteIconsAfter.count()) + (await downvoteIconsAfter.count());
    expect(totalVotesAfter).toBe(totalInitialVotes);
  });
});
