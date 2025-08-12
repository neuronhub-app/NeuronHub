import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";

test.describe("Apollo re-render", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("no infinite re-renders", async ({ page }) => {
    const consoleErrors: string[] = [];
    const renderCount = 0;

    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Track Apollo query executions
    await page.addInitScript(() => {
      let queryCount = 0;
      const originalFetch = window.fetch;
      // @ts-expect-error
      window.fetch = function (...args) {
        const url = args[0];
        if (typeof url === "string" && url.includes("/api/graphql")) {
          queryCount++;
          if (queryCount > 10) {
            console.error(`Excessive Apollo queries detected: ${queryCount}`);
          }
        }
        return originalFetch.apply(this, args);
      };
    });

    await page.goto(`${config.client.url}/reviews/`, {
      waitUntil: "networkidle",
      timeout: 5000,
    });

    // Ensure reviews actually loaded
    await pwh.get(ids.post.card.container).first().waitFor({ timeout: 5000 });
    const reviewCount = await pwh.get(ids.post.card.container).count();
    expect(reviewCount).toBeGreaterThan(0);

    // Check for re-render errors
    const reRenderError = consoleErrors.find(
      err =>
        err.includes("Too many re-renders") ||
        err.includes("Maximum update depth exceeded") ||
        err.includes("Excessive Apollo queries"),
    );
    expect(reRenderError).toBeUndefined();

    // Verify page rendered correctly
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("Reviews");
    expect(bodyText).not.toContain("Loading...");
    expect(bodyText).not.toContain("Error");
  });
});
