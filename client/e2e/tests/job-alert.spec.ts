import { layout } from "@/components/LayoutSidebar";
import { test } from "@playwright/test";
import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { urls } from "@/urls";

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
    await play.navigate(urls.jobs.list, { idleWait: true });

    if (env.site.isProbablyGood) {
      // todo ? refac: testid
      await expect(page.getByRole("link", { name: layout.label.jobAlerts() })).not.toBeVisible();
    } else {
      await expect($[ids.layout.sidebar]).not.toHaveText(layout.label.jobAlerts());
    }

    if (env.site.isProbablyGood) {
      await page.getByTestId(ids.facet.popover.otherFilters).last().click();
      await page.getByTestId(ids.facet.excludeCareerCapital).last().click();
    }

    const testEmail = "e2e@neuronhub.app";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const mutationSubscribe = play.waitForResponseGraphql(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    await mutationSubscribe;

    if (env.site.isProbablyGood) {
      await expect(page.getByRole("link", { name: layout.label.jobAlerts(1) })).toBeVisible();
    } else {
      await expect($[ids.layout.sidebar]).toHaveText(layout.label.jobAlerts(1));
    }

    const alertsQuery = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions);
    const alertsRes = await alertsQuery;
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    if (env.site.isProbablyGood) {
      await expect($[ids.job.subscriptions.card]).toHaveText("Exclude Career Capital");
    }

    // .is_active to false
    await play.click(ids.job.subscriptions.toggleBtn);
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();

    // 'auth' by /jobs/subscriptions/:id_ext
    await context.clearCookies();
    const alert = alertsRes.data.job_alerts!.find(a => a.email === testEmail)!;
    await play.navigate(urls.jobs.subscriptionsManage(alert.id_ext), { idleWait: true });
    await expect($[ids.job.subscriptions.card]).toBeVisible();
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // delete
    await play.click(ids.job.subscriptions.removeBtn);
    await expect(page).not.toHaveText(testEmail);
  });

  test("subscribe => delete by /jobs/subscriptions/remove/:id_ext (flaky -> run 2-3x if failed)", async ({
    page,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const testEmail = "e2e@neuronhub.app";

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const mutationSubscribe = play.waitForResponseGraphql(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    await mutationSubscribe;

    // Flaky:
    // > Error: response.json: Protocol error (Network.getResponseBody): No resource with given identifier found
    //
    // Maybe: try it after `play.navigate(subs)`
    const alertsQuery = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions);
    const alertsRes = await alertsQuery;
    const alert = alertsRes.data.job_alerts!.find(a => a.email === testEmail)!;

    await expect($[ids.job.subscriptions.unsubscribed.alert]).not.toBeVisible();

    await play.navigate(urls.jobs.subscriptionsRemove(alert.id_ext), { idleWait: true });
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();
    await expect($[ids.job.subscriptions.unsubscribed.alert]).toBeVisible();
  });
});
