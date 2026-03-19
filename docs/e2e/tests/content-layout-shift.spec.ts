/**
 * #AI #127
 *
 * Originally created to debug `prose.tsx` CSS CLS in SSR vs client code.
 *
 * ### prose.tsx CSS bug
 *
 * emotion injects <style> siblings during SSR,
 * breaking CSS :first-child and + (adjacent sibling) selectors
 * in Prose content-main variant → 33px CLS on hydration.
 */
import { expect, test } from "@playwright/test";

test("no CLS on overview page", async ({ page }) => {
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

  await page.goto("/usage/guides/overview", { waitUntil: "networkidle" });
  // Wait for hydration: emotion moves <style> tags from body to <head>
  await page.waitForFunction(() => document.readyState === "complete");

  const cls = await page.evaluate(() => (window as any).__clsTotal);
  expect(cls).toBe(0);
});
