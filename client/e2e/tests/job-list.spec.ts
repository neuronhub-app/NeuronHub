import { test } from "@playwright/test";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { urls } from "@/urls";

const isSiteProbablyGood = env.VITE_SITE === "pg";

test.describe("JobList", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.$;
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_create_jobs: true,
    });
  });

  // todo ! refac: #AI-slop, trash matchers, magic strings, no testid
  // replace "Subscriptions (1)" and "Subscriptions" with some `data-{}` attribute and testid usage
  test("subscribe to JobAlert, toggle and remove on /jobs/subscriptions/", async ({ page }) => {
    await play.navigate(urls.jobs.list);

    if (!isSiteProbablyGood) {
      await expect($[ids.layout.sidebar]).not.toHaveText("Subscriptions");
    }

    const testEmail = "e2e@test.com";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    await play.click(ids.job.alert.submitBtn);

    if (!isSiteProbablyGood) {
      await expect($[ids.layout.sidebar]).toHaveText("Subscriptions (1)");
    }

    await play.navigate(urls.jobs.subscriptions);
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // Pause & delete JobAlert
    await play.click(ids.job.subscriptions.toggleBtn);
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();
    await play.click(ids.job.subscriptions.removeBtn);
    await expect(page).not.toHaveText(testEmail);
  });

  test("subscribe & call /jobs/subscriptions/remove/:id_ext", async ({ page }) => {
    await play.navigate(urls.jobs.list);

    const testEmail = "e2e@test.com";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    await play.click(ids.job.alert.submitBtn);

    await play.navigate(urls.jobs.subscriptions, { idleWait: true });

    await expect($[ids.job.subscriptions.unsubscribed.alert]).not.toBeVisible();

    const result = await play.graphqlQuery(JobAlertListQuery, {}); // get .id_ext form GraphQL
    const alerts = result.data.job_alerts;
    const alert = alerts.find(alert => alert.email === testEmail)!;

    await page.goto(urls.jobs.subscriptionsRemove(alert.id_ext));
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();
    await expect($[ids.job.subscriptions.unsubscribed.alert]).toBeVisible();
  });
});
