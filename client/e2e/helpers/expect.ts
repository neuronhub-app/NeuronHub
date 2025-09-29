import type { Locator, Page } from "@playwright/test";
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

  // todo refac-name: to be unique
  // .stateChecked? .checkedState didn't look clear
  async checked(locator: Locator) {
    return runPlaywrightMatcher({
      context: this,
      name: "checked",
      locator,
      expected: true,
      assertion: async () => {
        const expectation = this.isNot ? expectBase(locator).not : expectBase(locator);
        await expectation.toHaveAttribute("data-state", "checked");
      },
    });
  },

  async toHaveTag(container: Locator, tagName: string) {
    const tag = container.getByTestId(`tag-${tagName}`);
    return runPlaywrightMatcher({
      context: this,
      name: "toHaveTag",
      locator: tag,
      expected: tagName,
      assertion: async () => {
        const expectation = this.isNot ? expectBase(tag).not : expectBase(tag);
        await expectation.toBeVisible();
      },
    });
  },
});
