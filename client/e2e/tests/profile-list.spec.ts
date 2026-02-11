import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

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

  test("renders profile cards", async ({ page }) => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    const cards = page.getByTestId(ids.profile.card.container);
    await cards.first().waitFor();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await play.screenshot("profile-list");
  });

  test("shows markdown without search, snippets with search", async ({ page }) => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    // Without search: rendered markdown from GraphQL enrichment
    const markdownContent = page.getByTestId(ids.profile.card.contentMarkdown);
    await markdownContent.first().waitFor();
    expect(await markdownContent.count()).toBeGreaterThanOrEqual(1);
    expect(await page.getByTestId(ids.profile.card.contentSnippet).count()).toBe(0);

    // Type search to activate Algolia snippets
    await page.getByPlaceholder("Search profiles").fill("Onni");
    await play.waitForNetworkIdle();

    const snippetContent = page.getByTestId(ids.profile.card.contentSnippet);
    await snippetContent.first().waitFor();
    expect(await snippetContent.count()).toBeGreaterThanOrEqual(1);

    await play.screenshot("profile-list-search-snippets");
  });
});
