import { type Locator, type Page, expect as expectBase } from "@playwright/test";

import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { layout } from "@/components/LayoutSidebar";
import { expect } from "@/e2e/helpers/expect";
import type { LocatorMapToGetFirstById } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { JobAlertUnsubscribeFeedbackMutation } from "@/sites/pg/pages/jobs/subscriptions/PgJobUnsubscribeFeedbackForm";
import { urls } from "@/urls";

const openPopover = "[data-part=content][data-scope=popover][data-state=open]";
const testEmail = "e2e@neuronhub.app";
const testComment = "I moved to a different field";

test.describe("Job Alert", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      {
        jobs_job: {
          title: "Summer Research Fellowship",
          org_name: "Arclight Research Institute",
          locations: ["Berkeley CA, United States"],
        },
      },
      {
        jobs_job: {
          title: "Country Director, East Africa Programs",
          org_name: "BridgeFund International",
          locations: ["Nairobi, Kenya"],
        },
      },
    ]);
  });

  // todo ! refac: #AI-slop - magic strings wo testid
  // - replace "Subscriptions (1)" with a `data-{}` & testid
  test("subscribe with locations => toggle inactive => reauth by id_ext => delete (flaky - run twice)", async ({
    page,
    context,
    play,
    $,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    if (env.site.isProbablyGood) {
      await expect(page.getByRole("link", { name: layout.label.jobAlerts() })).not.toBeVisible();
    } else {
      await expect($[ids.layout.sidebar]).not.toHaveText(layout.label.jobAlerts());
    }

    if (env.site.isProbablyGood) {
      const popover = page.locator(openPopover);

      // Select Kenya (country) + Berkeley (city)
      await page.getByTestId(ids.facet.popover.country).last().click();
      await clickFacetCheckbox(popover, "Kenya");
      await play.waitForNetworkIdle();
      await page.keyboard.press("Escape");

      await page.getByTestId(ids.facet.popover.city).last().click();
      await clickFacetCheckbox(popover, "Berkeley CA");
      await play.waitForNetworkIdle();
      await page.keyboard.press("Escape");
    }

    // Subscribe

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const requestVars = env.site.isProbablyGood
      ? play.waitForRequestGraphqlVars(JobAlertSubscribeMutation)
      : null;

    await play.click(ids.job.alert.submitBtn);

    if (requestVars) {
      expectBase((await requestVars).location_ids?.length).toBeGreaterThanOrEqual(2);
    } else {
      await play.waitForNetworkIdle();
    }

    await expectAlertsCountInNav(page, $, 1);

    // Navigate to subscriptions
    const alertsQuery = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions);
    const alertsRes = await alertsQuery;
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // Toggle inactive
    await play.click(ids.job.subscriptions.toggleBtn);
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();

    // Reauth by id_ext after clearCookies
    await context.clearCookies();
    const alert = alertsRes.data.job_alerts!.find(a => a.email === testEmail)!;
    await play.navigate(urls.jobs.subscriptionsManage(alert.id_ext), { idleWait: true });
    await expect($[ids.job.subscriptions.card]).toHaveText(testEmail);

    // Delete
    await play.click(ids.job.subscriptions.removeBtn);
    await expect(page).not.toHaveText(testEmail);
  });

  test("unsubscribe by /jobs/subscriptions/remove/:id_ext", async ({ page, play, $ }) => {
    test.slow();

    await play.navigate(urls.jobs.list, { idleWait: true });

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    await play.click(ids.job.alert.submitBtn);
    if (env.site.isProbablyGood) {
      // wo filters PG shows a confirm Popover
      await play.click(ids.job.alert.submitAllBtn);
    }
    // not `waitForResponseGraphql` - the mutation refetches mounted queries, evicting its body
    await expectAlertsCountInNav(page, $, 1);

    const alertsQuery = play.waitForResponseGraphql(JobAlertListQuery);
    await play.navigate(urls.jobs.subscriptions);
    const alertsRes = await alertsQuery;
    const alert = alertsRes.data.job_alerts!.find(a => a.email === testEmail)!;

    await expect($[ids.job.subscriptions.unsubscribed.alert]).not.toBeVisible();

    await play.navigate(urls.jobs.subscriptionsRemove(alert.id_ext), { idleWait: true });
    await expect($[ids.job.subscriptions.status.inactive]).toBeVisible();
    await expect($[ids.job.subscriptions.unsubscribed.alert]).toBeVisible();

    if (env.site.isProbablyGood) {
      await expect($[ids.job.subscriptions.feedback.form]).toBeVisible();
      await play.click(ids.job.subscriptions.feedback.option);
      await play.click(ids.job.subscriptions.feedback.optionComment);
      await play.fill(ids.job.subscriptions.feedback.comment, testComment);

      const requestFeedback = play.waitForRequestGraphqlVars(
        JobAlertUnsubscribeFeedbackMutation,
      );
      await play.click(ids.job.subscriptions.feedback.submit);
      const varsFeedback = await requestFeedback;
      expectBase(varsFeedback.reason_ids).toHaveLength(2);
      expectBase(varsFeedback.comment).toBe(testComment);
      await expect($[ids.job.subscriptions.feedback.submitted]).toBeVisible();
    }
  });
});

async function expectAlertsCountInNav(page: Page, $: LocatorMapToGetFirstById, count: number) {
  if (env.site.isProbablyGood) {
    await expect(page.getByRole("link", { name: layout.label.jobAlerts(count) })).toBeVisible();
  } else {
    await expect($[ids.layout.sidebar]).toHaveText(layout.label.jobAlerts(count));
  }
}

async function clickFacetCheckbox(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}
