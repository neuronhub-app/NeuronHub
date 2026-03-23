import { expect, test } from "@playwright/test";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { urls } from "@/urls";

/**
 * #AI, duplicate of docs/ [[content-layout-shift.spec.ts]]
 */
test.describe("Nav links CLS", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
  });

  test("no CLS from async nav/footer links", async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__clsTotal = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const shift = entry as any;
          if (!shift.hadRecentInput) {
            (window as any).__clsTotal += shift.value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(urls.jobs.list, { waitUntil: "networkidle" });
    // Wait for hydration: emotion moves <style> tags from body to <head>
    await page.waitForFunction(() => document.readyState === "complete");

    const cls = await page.evaluate(() => (window as any).__clsTotal);
    // CLS < 0.25 is "needs improvement" per Web Vitals; page has Algolia CLS too
    expect(cls).toBeLessThan(0.25);
  });
});
