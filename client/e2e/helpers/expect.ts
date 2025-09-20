import type { Page } from "@playwright/test";
import { expect as expectBase } from "@playwright/test";
import { runPlaywrightMatcher } from "@/e2e/helpers/run-playwright-matcher";

export const expect = expectBase.extend({
  async toHaveText(page: Page, expected: string, options?: { timeout?: number }) {
    const locator = page.locator(`text="${expected}"`);
    return runPlaywrightMatcher({
      context: this,
      name: "toHaveText",
      locator,
      expected,
      assertion: async () => {
        const expectation = this.isNot ? expectBase(locator).not : expectBase(locator);
        await expectation.toBeVisible(options);
      },
    });
  },

  async toHaveChecked(
    page: Page,
    id: string,
    expected: boolean,
    options?: { timeout?: number },
  ) {
    const locator = page.getByTestId(id).first();
    return runPlaywrightMatcher({
      context: this,
      name: "toHaveChecked",
      locator,
      expected,
      assertion: async () => {
        const expectation = this.isNot ? expectBase(locator).not : expectBase(locator);
        await expectation.toHaveAttribute(
          "data-state",
          expected ? "checked" : "unchecked",
          options,
        );
      },
    });
  },
});
