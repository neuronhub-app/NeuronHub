import { type Locator, type Page, expect as expectBase } from "@playwright/test";

import { expect } from "@/e2e/helpers/expect";
import type { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

const testEmail = "e2e-utm@neuronhub.app";

const utmParams = {
  utm_campaign: "jobboard-2026",
  utm_source: "linkedin",
  utm_content: "a1",
  utm_medium: "paid-social",
} as const;

// AutoSlugField(populate_from=["title", "org__name"]) of the job seeded in beforeEach.
const jobSlug = "country-director-east-africa-programs-bridgefund-international";

test.describe("Job Alert UTM attribution", () => {
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

  test("utm survives list entry + refinement => sent in JobAlertSubscribe", async ({
    page,
    play,
  }) => {
    test.skip(!env.site.isProbablyGood, "pg-only UTM router");
    await assertUtmSurvivesSubscribeFlow({ page, play, landingUrl: urls.jobs.list });
  });

  test("utm survives job-detail entry + refinement => sent in JobAlertSubscribe", async ({
    page,
    play,
  }) => {
    test.skip(!env.site.isProbablyGood, "pg-only UTM router");
    await assertUtmSurvivesSubscribeFlow({ page, play, landingUrl: urls.jobs.slug(jobSlug) });
  });
});

async function assertUtmSurvivesSubscribeFlow(args: {
  page: Page;
  play: PlaywrightHelper;
  landingUrl: string;
}) {
  const query = new URLSearchParams(utmParams).toString();
  await args.play.navigate(`${args.landingUrl}?${query}`, { idleWait: true });

  await test.step("utm survives InstantSearch ~400ms writeDelay URL rewrite", async () => {
    await args.play.waitForNetworkIdle();
    await expectUtmInUrl(args.page);
  });

  await test.step("utm survives country refinement", async () => {
    const popover = args.page
      .getByTestId(ids.facet.popover.content)
      .and(args.page.locator("[data-state=open]"));
    await args.page.getByTestId(ids.facet.popover.country).last().click();
    await clickFacetCheckbox(popover, "Kenya");
    await args.play.waitForNetworkIdle();
    await args.page.keyboard.press("Escape");

    await expect(args.page).toHaveURL(/Kenya/);
    await expectUtmInUrl(args.page);
  });

  await test.step("utm reaches JobAlertSubscribe mutation", async () => {
    await args.play.click(ids.job.alert.subscribeBtn);
    await args.play.fill(ids.job.alert.emailInput, testEmail);

    const requestPromise = args.page.waitForRequest(
      req =>
        req.url().includes("/graphql") &&
        (req.postData()?.includes("JobAlertSubscribe") ?? false),
    );
    await args.play.click(ids.job.alert.submitBtn);

    const body = JSON.parse((await requestPromise).postData()!);
    expectBase(body.variables?.utm_params).toEqual(utmParams);
  });
}

async function expectUtmInUrl(page: Page) {
  for (const [key, value] of Object.entries(utmParams)) {
    await expect(page).toHaveURL(url => url.searchParams.get(key) === value);
  }
}

async function clickFacetCheckbox(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}
