/**
 * #quality-14% #AI-slop
 *
 * It does the job. Will be rewritten once JobLocation refactor is done.
 */
import { expect as expectBase, type Locator, test } from "@playwright/test";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

const facetLabel = {
  remote: "Remote",
  country: "Country",
  city: "City",
} as const;

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

  test("cross-facet OR: Country + City shows results for non-overlapping values [idiotic hardcoded values]", async ({
    page,
  }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const jobCards = play.getAll(ids.job.card.container);

    // Select Country=Kenya (only BridgeFund) — single attr must still filter
    const countryBtn = page.getByRole("button", { name: facetLabel.country, exact: true });
    await countryBtn.click();

    const data = {
      country_1: "Kenya",
      city_london_6: "London",
      city_berkeley: "Berkeley CA",
    };

    const openPopover = "[data-part=content][data-scope=popover][data-state=open]";
    const popover = page.locator(openPopover);
    await clickFacetCheckboxByValue(popover, data.country_1);
    await expectBase(jobCards).toHaveCount(1);

    // City counts must NOT be AND-constrained by country=Kenya even with 1 attr.
    // London has 6 jobs in stubs; if AND'd by Kenya it shows 1.
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();
    const cityBtn = page.getByRole("button", { name: facetLabel.city, exact: true });
    await cityBtn.click();
    await play.waitForNetworkIdle();
    const londonCountBefore = await getFacetCount(popover, data.city_london_6);
    expectBase(londonCountBefore).toBe(6);

    // Select City=Berkeley (only Arclight — no Kenya overlap)
    await clickFacetCheckboxByValue(popover, data.city_berkeley);
    await play.waitForNetworkIdle();

    // AND => 0 results (no job has both Kenya + Berkeley)
    // OR  => 2 results (BridgeFund + Arclight)
    await expectBase(jobCards).toHaveCount(2);

    // Counts must stay correct after 2nd attr click too
    const londonCountAfter = await getFacetCount(popover, data.city_london_6);
    expectBase(londonCountAfter).toBe(6);
  });
});

async function clickFacetCheckboxByValue(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}

// #quality-0%
async function getFacetCount(popover: Locator, value: string): Promise<number> {
  const checkbox = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  // Count is the last <p>/<span> text in the checkbox grid (label | count)
  const countText = await checkbox.locator("p").last().textContent();
  return Number(countText);
}

// unused #AI
async function clickFacetCheckbox(popover: Locator, index = 0) {
  const item = popover.locator("[data-testid^='facet.checkbox.']").nth(index);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}
