import { test } from "@playwright/test";
import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("Login", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulate({ is_import_HN_post: false, is_create_single_review: false });
  });

  test("with email", async ({ page }) => {
    await page.goto(urls.login);
    await play.fill(ids.auth.login.username, config.user.email);
    await play.fill(ids.auth.login.password, config.user.password);
    await play.click(ids.auth.login.submit);

    await page.waitForURL(urls.home);
    await expect(play.get(ids.auth.logout.btn)).toBeVisible();
  });
});
