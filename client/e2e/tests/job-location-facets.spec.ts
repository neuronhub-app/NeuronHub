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

  test("cross-popover OR + Algolia counts", async ({ page }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);
    const jobCards = play.getAll(ids.job.card.container);
    const countryBtn = page.getByTestId(ids.facet.popover.country).last();

    // Country popover shows Algolia counts (no filters active)
    await countryBtn.click();
    await expectBase(facetItemCount(page, "United States")).toHaveText("9");
    await expectBase(facetItemCount(page, "Kenya")).toHaveText("1");

    // Select Kenya → only BridgeFund
    await clickFacetCheckbox(popover, "Kenya");
    await play.waitForNetworkIdle();
    await expectBase(jobCards).toHaveCount(1);

    // Select Berkeley (city) → OR → BridgeFund + Arclight
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();
    await page.getByTestId(ids.facet.popover.city).last().click();
    await clickFacetCheckbox(popover, "Berkeley CA, USA");
    await play.waitForNetworkIdle();
    await expectBase(jobCards).toHaveCount(2);
  });
});

async function clickFacetCheckbox(popover: Locator, value: string) {
  const item = popover.locator(`[data-testid='${ids.facet.checkbox(value)}']`);
  await expectBase(item).toBeVisible();
  await item.locator("[data-part=control]").click();
}

/** Last <p> inside Checkbox.Root is the facet count (Chakra grid: control | name | count) */
function facetItemCount(page: Page, value: string) {
  return page.getByTestId(ids.facet.checkbox(value)).locator("p").last();
}
