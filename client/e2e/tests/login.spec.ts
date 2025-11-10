import { test } from "@playwright/test";
import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

// will stay unused for a while, mb until v0.3
test.describe("Login", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulate();
  });

  test("with invalid credentials", async ({ page }) => {
    await page.goto(urls.login);

    await play.fill(ids.auth.login.username, "wrong");
    await play.fill(ids.auth.login.password, "wrong");
    await play.click(ids.auth.login.submit);

    await expect(play.get(ids.auth.login.error)).toBeVisible();
  });

  test("with email", async ({ page }) => {
    await page.goto(urls.login);
    await play.fill(ids.auth.login.username, config.user.email);
    await play.fill(ids.auth.login.password, config.user.password);
    await play.click(ids.auth.login.submit);

    await page.waitForURL(urls.reviews.list);
    await expect(play.get(ids.auth.logout.btn)).toBeVisible();
  });
});
