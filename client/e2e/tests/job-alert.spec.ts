import { test } from "@playwright/test";
import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { urls } from "@/urls";

const isSiteProbablyGood = env.VITE_SITE === "pg";

test.describe("Job Alert", () => {
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

  // todo ! refac: #AI-slop - magic strings wo testid
  // replace "Subscriptions (1)" with a `data-{}` & testid
  test("subscribe => .is_active to false => clearCookies => 'auth' by /jobs/subscriptions/:id_ext => delete", async ({
    page,
    context,
  }) => {
    await play.navigate(urls.jobs.list);

    const sidebarSubsLabel = "Subscriptions";

    if (!isSiteProbablyGood) {
      await expect($[ids.layout.sidebar]).not.toHaveText(sidebarSubsLabel);
    }

    const testEmail = "e2e@neuronhub.app";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const mutationSubscribe = play.waitForResponseGraphql(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    await mutationSubscribe;

    if (!isSiteProbablyGood) {
      await expect($[ids.layout.sidebar]).toHaveText(`${sidebarSubsLabel} (1)`);
    }

    const alertsQuery = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions);
    const alertsRes = await alertsQuery;
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // .is_active to false
    await play.click(ids.job.subscriptions.toggleBtn);
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();

    // 'auth' by /jobs/subscriptions/:id_ext
    await context.clearCookies();
    const alert = alertsRes.data.job_alerts!.find(a => a.email === testEmail)!;
    await page.goto(urls.jobs.subscriptionsManage(alert.id_ext));
    await play.waitForNetworkIdle();
    await expect($[ids.job.subscriptions.card]).toBeVisible();
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // delete
    await play.click(ids.job.subscriptions.removeBtn);
    await expect(page).not.toHaveText(testEmail);
  });

  test("subscribe => delete by /jobs/subscriptions/remove/:id_ext", async ({ page }) => {
    await play.navigate(urls.jobs.list);

    const testEmail = "e2e@neuronhub.app";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const mutationSubscribe = play.waitForResponseGraphql(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    await mutationSubscribe;

    const queryList = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions, { idleWait: true });
    const response = await queryList;
    const alert = response.data.job_alerts!.find(a => a.email === testEmail)!;

    await expect($[ids.job.subscriptions.unsubscribed.alert]).not.toBeVisible();

    await page.goto(urls.jobs.subscriptionsRemove(alert.id_ext));
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();
    await expect($[ids.job.subscriptions.unsubscribed.alert]).toBeVisible();
  });
});
