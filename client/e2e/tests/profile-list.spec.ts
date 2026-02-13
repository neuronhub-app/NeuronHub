import type { Locator } from "@playwright/test";
import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

// #AI
test.describe("ProfileList", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_import_profiles_csv: true,
    });
  });

  test("shows markdown without search, snippets with search", async ({ page }) => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    // Without search: rendered markdown from GraphQL enrichment
    const markdownContent = page.getByTestId(ids.profile.card.contentMarkdown);
    await markdownContent.first().waitFor();
    expect(await markdownContent.count()).toBeGreaterThanOrEqual(1);
    expect(await page.getByTestId(ids.profile.card.contentSnippet).count()).toBe(0);

    // Type search to activate Algolia snippets
    const searchInput = page.getByTestId(ids.profile.searchInput);
    await searchInput.fill("On");
    await play.waitForNetworkIdle();

    const snippetContent = page.getByTestId(ids.profile.card.contentSnippet);
    await snippetContent.first().waitFor();
    expect(await snippetContent.count()).toBeGreaterThanOrEqual(1);
  });
});
