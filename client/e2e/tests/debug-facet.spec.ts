import { test } from "@playwright/test";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { urls } from "@/urls";

test("debug facet testids", async ({ page }) => {
  const play = new PlaywrightHelper(page);
  await play.dbStubsRepopulateAndLogin({
    is_import_HN_post: false,
    is_create_single_review: false,
    is_create_jobs: true,
  });
  await play.navigate(urls.jobs.list, { idleWait: true });
  const html = await page.locator("[data-part=trigger][data-scope=popover]").first().evaluate(el => el.outerHTML);
  console.log("TRIGGER HTML:", html);
  const allTestIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[data-testid]")).map(el => el.getAttribute("data-testid"));
  });
  console.log("ALL TESTIDS:", allTestIds);
});
