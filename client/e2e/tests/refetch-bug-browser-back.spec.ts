import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Apollo refetch after browser navigation", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("vote updates after browser back navigation", async ({ page }) => {
    await pwh.navigate(urls.reviews.$);
    await pwh.waitForText("Reviews");

    const firstVoteCount = pwh.get(ids.post.vote.count);
    await expect(firstVoteCount).toBeVisible();
    const initialCount = Number.parseInt((await firstVoteCount.textContent()) ?? "0");

    await pwh.click(ids.post.card.link);

    await page.waitForURL(/\/reviews\/\d+/);
    await page.waitForLoadState("networkidle");

    await page.goBack();
    await page.waitForURL(`**/${urls.reviews.$}`);
    await pwh.waitForText("Reviews");

    const voteBtn = pwh.get(ids.post.vote.up);
    await expect(voteBtn).toBeVisible();
    await voteBtn.click();

    await page.waitForResponse(
      response =>
        response.url().includes(config.server.apiUrl) && response.request().method() === "POST",
    );

    await page.waitForTimeout(1000);

    const updatedVoteCountElement = pwh.get(ids.post.vote.count);
    const updatedCount = Number.parseInt((await updatedVoteCountElement.textContent()) ?? "0");

    expect(updatedCount).toBe(initialCount + 1);
  });
});
