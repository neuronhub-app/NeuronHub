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
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${config.client.url}/reviews/`, { waitUntil: "networkidle" });

    const reviewCount = await pwh.getAll(ids.post.card.container).count();
    expect(reviewCount).toBeGreaterThan(0);

    // Check for re-render errors
    const reRenderError = consoleErrors.find(
      err => err.includes("Too many re-renders") || err.includes("depth exceeded"),
    );
    expect(reRenderError).toBeUndefined();

    // Verify page rendered correctly
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("Reviews");
    expect(bodyText).not.toContain("Loading...");
    expect(bodyText).not.toContain("Error");
  });
});
