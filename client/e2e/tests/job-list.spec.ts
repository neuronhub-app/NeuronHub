import { test } from "@playwright/test";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

// #AI
test.describe("JobList", () => {
  test.describe.configure({ mode: "serial" });

  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;
  let isPopulated = false;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.$;
    if (!isPopulated) {
      await play.dbStubsRepopulateAndLogin({
        is_import_HN_post: false,
        is_create_single_review: false,
        is_import_jobs_csv: true,
      });
      isPopulated = true;
    } else {
      await play.login();
    }
  });

  test("search filters jobs", async ({ page }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const searchInput = page.getByTestId(ids.job.searchInput);
    await searchInput.fill("Research");
    await play.waitForNetworkIdle();
  });
});
