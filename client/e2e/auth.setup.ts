/**
 * `test_gen_reset` keeps the default user -> Django sessionid cookie stays valid.
 * #AI
 */
import { test as setup } from "@playwright/test";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { authSetupStatePath } from "@/e2e/test";

setup("authenticate default user", async ({ page }) => {
  const play = new PlaywrightHelper(page);
  await play.reset_db();
  await play.login();
  await page.context().storageState({ path: authSetupStatePath });
});
