import { expect, test } from "@playwright/test";
import { urls } from "@/urls";

/**
 * #AI, based on docs/ [[content-layout-shift.spec.ts]]
 */
test("no CLS on jobs list page", async ({ page }) => {
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
  await page.waitForFunction(() => document.readyState === "complete");

  const cls = await page.evaluate(() => (window as any).__clsTotal);
  expect(cls).toBeLessThan(0.05);
});
