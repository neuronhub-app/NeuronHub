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
    const $ = play.$;
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

  test("tags render as non-empty JSON values, before and after search", async ({ page }) => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    const tags = page.getByTestId(ids.profile.card.tags);
    await tags.first().waitFor();

    await assertTagsAreNonEmpty(tags);

    // Activate search — tags must still render real values from Algolia JSON objects
    await page.getByPlaceholder("Search profiles").fill("Onni");
    await play.waitForNetworkIdle();

    const tagsAfter = page.getByTestId(ids.profile.card.tags);
    await tagsAfter.first().waitFor();

    await assertTagsAreNonEmpty(tagsAfter);

    await play.screenshot("profile-list-tags-after-search");
  });
});

async function assertTagsAreNonEmpty(tagsLocator: Locator) {
  const text = await tagsLocator.first().textContent();
  expect(text!.trim().length, "tags container should have text").toBeGreaterThan(0);
  expect(text, "tags should not contain [object").not.toContain("[object");
  expect(text, "tags should not contain undefined").not.toContain("undefined");
}
