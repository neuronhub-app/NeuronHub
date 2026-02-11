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
});
