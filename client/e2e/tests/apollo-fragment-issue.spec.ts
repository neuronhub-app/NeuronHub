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
    // Intercept GraphQL to verify fragments are working
    let graphqlResponse: any = null;

    page.on("response", async response => {
      if (response.url().includes("/api/graphql") && response.request().method() === "POST") {
        const postData = response.request().postData();
        if (postData && postData.includes("ReviewList")) {
          graphqlResponse = await response.json();
        }
      }
    });

    await page.goto(`${config.client.url}/reviews`);
    await page.waitForLoadState("networkidle");

    // Wait for review cards to ensure data loaded
    await pwh.get(ids.post.card.container).first().waitFor({ timeout: 5000 });
    const reviewCards = await pwh.get(ids.post.card.container).count();
    expect(reviewCards).toBeGreaterThan(0);

    // Verify GraphQL response has all expected fields
    expect(graphqlResponse).toBeTruthy();
    expect(graphqlResponse.data).toBeTruthy();
    expect(graphqlResponse.data.post_reviews).toBeTruthy();
    expect(graphqlResponse.data.post_reviews.length).toBeGreaterThan(0);

    const firstReview = graphqlResponse.data.post_reviews[0];
    expect(firstReview).toBeTruthy();

    // PostReviewFragment specific fields
    expect(firstReview.review_importance).toBeDefined();
    expect(firstReview.review_usage_status).toBeDefined();
    expect(firstReview.review_rating).toBeDefined();
    expect(firstReview.review_experience_hours).toBeDefined();
    expect(firstReview.reviewed_at).toBeDefined();

    // PostFragment fields (should be included via fragment spreading)
    expect(firstReview.id).toBeDefined();
    expect(firstReview.__typename).toBe("PostReviewType");
    expect(firstReview.type).toBeDefined();
    expect(firstReview.title).toBeDefined();
    expect(firstReview.content).toBeDefined();
    expect(firstReview.author).toBeDefined();
    expect(firstReview.updated_at).toBeDefined();

    // Verify UI renders these fields correctly
    const firstCardLink = pwh.get(ids.post.card.link);
    const linkText = await firstCardLink.textContent();
    expect(linkText).toBe(firstReview.title);
  });
});
