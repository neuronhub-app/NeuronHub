import { test } from "@playwright/test";
import { highlighter } from "@/apps/highlighter/highlighter";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { urls } from "@/urls";

test.describe("Library", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    const timeoutExtra = 7000;
    play = new PlaywrightHelper(page, timeoutExtra);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("db_stubs_repopulate PostHighlights are visible", async ({ page }) => {
    await page.goto(urls.library);

    const highlights = page.locator(`[data-${highlighter.attrs.highlightId}]`);
    // [[db_stubs_repopulate.py]] creates 2 highlights
    await expect(highlights).toHaveCount(2);
  });
});
