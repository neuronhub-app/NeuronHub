import { test } from "@playwright/test";

import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Login", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulate();
  });

  test("with invalid credentials", async ({ page }) => {
    await page.goto(urls.login);

    await helper.fill(ids.auth.login.username, "wrong");
    await helper.fill(ids.auth.login.password, "wrong");
    await helper.click(ids.auth.login.submit);

    await expect(helper.get(ids.auth.login.error)).toBeVisible();
  });

  test("with email", async ({ page }) => {
    await page.goto(urls.login);
    await helper.fill(ids.auth.login.username, config.user.email);
    await helper.fill(ids.auth.login.password, config.user.password);
    await helper.click(ids.auth.login.submit);

    await page.waitForURL(urls.reviews.list);
    await expect(helper.get(ids.auth.logout.btn)).toBeVisible();
  });
});
