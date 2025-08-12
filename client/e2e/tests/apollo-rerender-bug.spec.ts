import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";

test.describe("Apollo infinite re-render bug", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbResetAndLogin();
  });

  test("should not cause infinite re-renders", async ({ page }) => {
    // Listen for all console messages
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === "error") {
        consoleErrors.push(text);
      }
    });

    // Listen for page errors
    const pageErrors: Error[] = [];
    page.on("pageerror", error => {
      pageErrors.push(error);
    });

    // Navigate to reviews page which uses Apollo
    await page.goto(`${config.client.url}/reviews/`, {
      waitUntil: "domcontentloaded",
      timeout: 5000,
    });

    // Wait a bit to see if any errors occur
    await page.waitForTimeout(2000);

    // Check for the specific React re-render error
    const reRenderError = consoleErrors.find(
      err =>
        err.includes("Too many re-renders") || err.includes("Maximum update depth exceeded"),
    );

    // Assert no infinite re-render error
    expect(reRenderError, `Found infinite re-render error: ${reRenderError}`).toBeUndefined();

    // Log all messages for debugging
    console.log("All console messages:", consoleMessages.slice(0, 20));
    if (consoleErrors.length > 0) {
      console.log("Console errors:", consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log(
        "Page errors:",
        pageErrors.map(e => e.message),
      );
    }

    // Check that the page actually rendered something
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toBe("");
    expect(bodyText).not.toContain("Loading...");
  });
});
