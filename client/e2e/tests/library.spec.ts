import { test } from "@playwright/test";
import { highlight_attrs } from "@/apps/highlighter/PostContentHighlighted";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { urls } from "@/urls";

test.describe("Library", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    const timeoutExtra = 7000;
    play = new PlaywrightHelper(page, timeoutExtra);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: true,
    });
    $ = play.locator();
  });

  test("db_stubs_repopulate PostHighlights are visible", async ({ page }) => {
    await page.goto(urls.library);

    const highlights = page.locator(`[data-${highlight_attrs.highlightId}]`);
    // [[db_stubs_repopulate.py]] creates 2 highlights
    await expect(highlights).toHaveCount(2);
  });
});
