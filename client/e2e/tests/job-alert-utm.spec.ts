import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

test.describe("Job Alert UTM attribution", () => {
  test.skip(!env.site.isProbablyGood, "only PG sends utm_params");

  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      {
        jobs_job: {
          title: "Country Director, East Africa Programs",
          org_name: "BridgeFund International",
          locations: ["Nairobi, Kenya"],
        },
      },
    ]);
  });

  test("utm of the landing URL is sent by JobAlertSubscribe from an utm-less URL", async ({
    play,
  }) => {
    const testEmail = "e2e-utm@neuronhub.app";

    const utmParams = {
      utm_source: "linkedin",
      utm_medium: "paid-social",
      utm_campaign: "jobboard-2026",
      utm_content: "a1",
    } as const;

    await play.navigate(`${urls.jobs.list}?${new URLSearchParams(utmParams).toString()}`, {
      idleWait: true,
    });
    await play.navigate(urls.jobs.list, { idleWait: true });

    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, testEmail);

    const requestVars = play.waitForRequestGraphqlVars(JobAlertSubscribeMutation);
    await play.click(ids.job.alert.submitBtn);
    // wo filters PG shows a confirm Popover
    await play.click(ids.job.alert.submitAllBtn);

    expect((await requestVars).utm_params).toEqual(utmParams);
  });
});
