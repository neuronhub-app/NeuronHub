import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { urls } from "@/urls";

const isPg = env.VITE_SITE === "pg";

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
        is_create_jobs: true,
      });
      isPopulated = true;
    } else {
      await play.login();
    }
  });

  // todo ! refac: #AI-slop, trash matchers, magic strings, no testid
  test("subscribe to JobAlert, toggle and remove on /jobs/subscriptions/", async ({ page }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const sidebar = page.locator('[aria-label="Sidebar"]');

    if (!isPg) {
      await expect(sidebar).not.toHaveText("Subscriptions");
    }

    const testEmail = "e2e@test.com";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    await play.click(ids.job.alert.submitBtn);

    if (!isPg) {
      await expect(sidebar).toHaveText("Subscriptions (1)");
    }

    // Email should be pre-populated from user account when re-opening the dialog
    await play.click(ids.job.alert.subscribeBtn);
    const emailInput = page.locator(ids.selector(ids.job.alert.emailInput));
    await expect(emailInput).not.toHaveValue("");
    await page.keyboard.press("Escape");

    await play.navigate(urls.jobs.subscriptions);
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // Pause the alert
    await play.click(ids.job.subscriptions.toggleBtn);
    await expect($[ids.job.subscriptions.card]).toHaveText("Inactive");

    // Remove button appears for inactive alerts
    await play.click(ids.job.subscriptions.removeBtn);

    // Card should be gone
    await expect(page).not.toHaveText(testEmail);

    if (!isPg) {
      await expect(sidebar).not.toHaveText("Subscriptions");
    }
  });
});
