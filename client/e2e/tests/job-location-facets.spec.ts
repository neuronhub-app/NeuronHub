/**
 * #quality-20% #AI
 * - bad magic strings
 * - terrible magic numbers
 * - facetItemCount
 */
import { type Page, expect as expectBase, type Locator, test } from "@playwright/test";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

const openPopover = "[data-part=content][data-scope=popover][data-state=open]";

test.describe("PG Job Location Facets", () => {
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

  test("cross-popover OR: Country + City selects on same locations.algolia_filter_name attr", async ({
    page,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const jobCards = play.getAll(ids.job.card.container);

    // Select "Kenya" from Country popover → only BridgeFund
    const countryBtn = page.getByTestId(ids.facet.popover.country).last();
    await countryBtn.click();
    const popover = page.locator(openPopover);
    await clickFacetCheckboxByValue(popover, "Kenya");
    await play.waitForNetworkIdle();
    await expectBase(jobCards).toHaveCount(1);

    // Select "Berkeley CA, USA" from City popover → OR → BridgeFund + Arclight
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();
    const cityBtn = page.getByTestId(ids.facet.popover.city).last();
    await cityBtn.click();
    await clickFacetCheckboxByValue(popover, "Berkeley CA, USA");
    await play.waitForNetworkIdle();
    await expectBase(jobCards).toHaveCount(2);
  });
});

async function clickFacetCheckboxByValue(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}

test.describe("PG Job Location - badge count + clear per-popover isolation", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_create_jobs: true,
    });
  });

  test("selecting Country shows badge only on Country popover, not Remote or City", async ({
    page,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);

    const countryBtn = page.getByTestId(ids.facet.popover.country).last();
    const remoteBtn = page.getByTestId(ids.facet.popover.remote).last();
    const cityBtn = page.getByTestId(ids.facet.popover.city).last();

    await countryBtn.click();
    await clickFacetCheckboxByValue(popover, "Kenya");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();

    // Country badge should show (1)
    await expectBase(countryBtn.getByText("(1)")).toBeVisible();
    // Remote and City should NOT show any badge
    await expectBase(remoteBtn.getByText("(1)")).not.toBeVisible();
    await expectBase(cityBtn.getByText("(1)")).not.toBeVisible();
  });

  test("clearing Country does not clear City selections", async ({ page }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);

    const countryBtn = page.getByTestId(ids.facet.popover.country).last();
    const cityBtn = page.getByTestId(ids.facet.popover.city).last();

    // Select Kenya in Country
    await countryBtn.click();
    await clickFacetCheckboxByValue(popover, "Kenya");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");

    // Select Berkeley in City
    await cityBtn.click();
    await clickFacetCheckboxByValue(popover, "Berkeley CA, USA");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");

    // Clear Country via its X button
    const clearCountry = page.getByTestId(ids.facet.clear(ids.facet.popover.country)).last();
    await clearCountry.click();
    await play.waitForNetworkIdle();

    // Country badge gone
    await expectBase(countryBtn.getByText("(1)")).not.toBeVisible();
    // City badge still shows (1)
    await expectBase(cityBtn.getByText("(1)")).toBeVisible();
  });
});

test.describe("PG Job Location - cross-facet count update", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_create_jobs: true,
    });
  });

  test("selecting Cause Area updates location counts via Algolia", async ({ page }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);
    const countryBtn = page.getByTestId(ids.facet.popover.country).last();

    await countryBtn.click();
    await expectBase(facetItemCount(page, "United States")).toHaveText("9");
    await expectBase(facetItemCount(page, "Kenya")).toHaveText("1");
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();

    // Select AIS → BridgeFund (GlobalHealth) excluded from results
    await page.getByTestId(ids.facet.popover.causeArea).last().click();
    await clickFacetCheckboxByValue(popover, "AI Safety & Policy");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();

    await countryBtn.click();
    await expectBase(facetItemCount(page, "United States")).toHaveText("3");
    await expectBase(facetItemCount(page, "Kenya")).toHaveText("0");
  });
});

test.describe("PG Job Location - Subscribe with location facets", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_create_jobs: true,
    });
  });

  test("subscribe with Country + City sends typed location params via lookup", async ({
    page,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);

    // Select "Kenya" from Country popover
    await page.getByTestId(ids.facet.popover.country).last().click();
    await clickFacetCheckboxByValue(popover, "Kenya");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");

    // Select "Berkeley CA, USA" from City popover
    await page.getByTestId(ids.facet.popover.city).last().click();
    await clickFacetCheckboxByValue(popover, "Berkeley CA, USA");
    await play.waitForNetworkIdle();
    await page.keyboard.press("Escape");

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(2);

    // Subscribe and check mutation params
    await play.click(ids.job.alert.subscribeBtn);
    await play.fill(ids.job.alert.emailInput, "e2e-location@neuronhub.app");

    const requestPromise = page.waitForRequest(
      req =>
        req.url().includes("/graphql") &&
        (req.postData()?.includes("JobAlertSubscribe") ?? false),
    );
    await play.click(ids.job.alert.submitBtn);
    const request = await requestPromise;

    const body = JSON.parse(request.postData()!);
    const locationIds: number[] = body.variables?.location_ids ?? [];

    expectBase(locationIds.length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * Last <p> inside Checkbox.Root is the facet count (Chakra grid: control | name | count)
 * */
function facetItemCount(page: Page, value: string) {
  return page.getByTestId(ids.facet.checkbox(value)).locator("p").last();
}
