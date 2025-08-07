import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

// #AI
test.describe("Refetch bug with browser back navigation", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("refetchAllQueries fails after browser back navigation", async ({ page }) => {
    // 1. Navigate to /reviews/
    await pwh.navigate(urls.reviews.$);
    await pwh.waitForText("Reviews");

    // Get initial vote count for first post
    const firstVoteCount = pwh.get(ids.post.vote.count).first();
    await expect(firstVoteCount).toBeVisible();
    const initialCount = Number.parseInt((await firstVoteCount.textContent()) || "0");

    // 2. Click on first review link to navigate to detail page
    const firstReviewLink = pwh.get(ids.post.card.link);
    await expect(firstReviewLink).toBeVisible();
    await firstReviewLink.click();

    // Wait for detail page to load
    await page.waitForURL(/\/reviews\/\d+/);
    await page.waitForLoadState("networkidle");

    // 3. Go back to /reviews/ with browser Back button
    await page.goBack();
    await page.waitForURL(`**/${urls.reviews.$}`);
    await pwh.waitForText("Reviews");

    // 4. Vote on the first post
    const voteBtn = pwh.get(ids.post.vote.up).first();
    await expect(voteBtn).toBeVisible();

    // Click vote button
    await voteBtn.click();

    // Wait for mutation to complete
    await page.waitForResponse(
      response =>
        response.url().includes(config.server.apiUrl) && response.request().method() === "POST",
    );

    // Give some time for potential refetch
    await page.waitForTimeout(1000);

    // Check if vote count updated
    const updatedVoteCountElement = pwh.get(ids.post.vote.count).first();
    const updatedCount = Number.parseInt((await updatedVoteCountElement.textContent()) || "0");

    // Bug: The vote count should be incremented but it's not because refetch didn't happen
    expect(updatedCount).toBe(initialCount + 1);
  });
});
