import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";

test.describe("Apollo fragment spreading", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("PostReviewFragment includes PostFragment fields", async ({ page }) => {
    let gqlResponse: any = null;

    page.on("response", async response => {
      if (response.url().includes("/api/graphql") && response.request().method() === "POST") {
        const postData = response.request().postData();
        if (postData?.includes("ReviewList")) {
          gqlResponse = await response.json();
        }
      }
    });

    await page.goto(`${config.client.url}/reviews`);

    const reviewCards = await pwh.getAll(ids.post.card.container).count();
    expect(reviewCards).toBeGreaterThan(0);

    const firstReview = gqlResponse.data.post_reviews[0];
    expect(firstReview).toBeTruthy();
    expect(firstReview.reviewed_at).toBeDefined();

    const linkText = await pwh.get(ids.post.card.link).textContent();
    expect(linkText).toBe(firstReview.title);
  });
});
