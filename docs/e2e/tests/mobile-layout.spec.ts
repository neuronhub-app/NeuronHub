/**
 * #AI
 */
import { expect, type Locator, type Page, test } from "@playwright/test";
import { ReactRouterPath } from "@/utils/types";
import { href } from "react-router";

const mobile = { width: 390, height: 844 };

const routes = {
  sentry: path("/usage/guides/sentry"),
  deploy: path("/development/guides/deploy"),
  analytics: path("/usage/guides/analytics"),
  overview: path("/usage/guides/overview"),
};

test.use({ viewport: mobile });

test.describe("Mobile layout", () => {
  test("no horizontal scroll", async ({ page }) => {
    await page.goto(routes.deploy);
    await page.waitForLoadState("networkidle");

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
});

// --- helpers ---

function path(path: ReactRouterPath) {
  return href(path);
}

function $(page: Page): Record<string, Locator> {
  return new Proxy({} as Record<string, Locator>, {
    get: (_, id: string) => page.getByTestId(id).first(),
  });
}
