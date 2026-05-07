import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { testNoAuth } from "@/e2e/test";
import { urls } from "@/urls";

testNoAuth.describe("Login", () => {
  testNoAuth.beforeEach(async ({ play }) => {
    await play.genReset();
  });

  testNoAuth("with email", async ({ page, play }) => {
    await page.goto(urls.login);
    await play.fill(ids.auth.login.username, config.user.email);
    await play.fill(ids.auth.login.password, config.user.password);
    await play.click(ids.auth.login.submit);

    await page.waitForURL(urls.home);
    await expect(play.get(ids.auth.logout.btn)).toBeVisible();
  });
});
