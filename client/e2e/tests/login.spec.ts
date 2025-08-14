import { expect, test } from "@playwright/test";
import { config } from "@/e2e/config";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Login", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulate();
  });

  test("with invalid credentials", async ({ page }) => {
    await page.goto(urls.login);

    await helper.get(ids.auth.login.username).fill("wrong");
    await helper.get(ids.auth.login.password).fill("wrong");
    await helper.click(ids.auth.login.submit);

    await expect(helper.get(ids.auth.login.error)).toBeVisible();
  });

  test("with email", async ({ page }) => {
    await page.goto(urls.login);
    await helper.get(ids.auth.login.username).fill(config.user.email);
    await helper.get(ids.auth.login.password).fill(config.user.password);
    await helper.click(ids.auth.login.submit);

    await page.waitForURL(urls.reviews.list);
    await expect(helper.get(ids.auth.logout.btn)).toBeVisible();
  });
});
