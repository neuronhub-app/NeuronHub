import { layout } from "@/components/LayoutSidebar";
import { type Locator, expect as expectBase } from "@playwright/test";
import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

const openPopover = "[data-part=content][data-scope=popover][data-state=open]";
const testEmail = "e2e@neuronhub.app";

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
  test("subscribe with locations => toggle inactive => reauth by id_ext => delete", async ({
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
    const requestPromise = env.site.isProbablyGood
      ? page.waitForRequest(
          req =>
            req.url().includes("/graphql") &&
            (req.postData()?.includes("JobAlertSubscribe") ?? false),
        )
      : null;

    await play.click(ids.job.alert.submitBtn);

    if (env.site.isProbablyGood && requestPromise) {
      const body = JSON.parse((await requestPromise).postData()!);
      expectBase(body.variables?.location_ids?.length).toBeGreaterThanOrEqual(2);
    } else {
      await play.waitForNetworkIdle();
    }

    if (env.site.isProbablyGood) {
      await expect(page.getByRole("link", { name: layout.label.jobAlerts(1) })).toBeVisible();
    } else {
      await expect($[ids.layout.sidebar]).toHaveText(layout.label.jobAlerts(1));
    }

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

  test("unsubscribe by /jobs/subscriptions/remove/:id_ext", async ({ play, $ }) => {
    test.slow();

    await play.navigate(urls.jobs.list, { idleWait: true });

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);
    const responseSubscribe = play.waitForGraphqlQuery(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    if (env.site.isProbablyGood) {
      // wo filters PG shows a confirm Popover
      await play.click(ids.job.alert.submitAllBtn);
    }
    await responseSubscribe;

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

async function clickFacetCheckbox(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}
