/**
 * #quality-25% #AI
 * - magic strings
 * - facetItemCount
 */
import { type Page, expect as expectBase, type Locator } from "@playwright/test";

import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

const openPopover = "[data-part=content][data-scope=popover][data-state=open]";

const loc = {
  US: "United States",
  Kenya: "Kenya",
  BerkeleyCa: "Berkeley CA",
};

test.skip(!env.site.isProbablyGood, "Location facets are PG-only");

test.describe("PG Job Location Facets", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      { jobs_job: { locations: [`San Francisco CA, ${loc.US}`] } },
      { jobs_job: { locations: [`Oakland CA, ${loc.US}`] } },
      { jobs_job: { locations: [`Washington DC, ${loc.US}`] } },
      { jobs_job: { locations: [`${loc.BerkeleyCa}, ${loc.US}`] } },
      { jobs_job: { locations: [`Nairobi, ${loc.Kenya}`] } },
      { jobs_job: { locations: ["Remote, Global"] } },
    ]);
  });

  test("cross-popover OR + Algolia counts", async ({ page, play }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });
    const popover = page.locator(openPopover);
    const jobCards = play.getAll(ids.job.card.container);
    const countryBtn = page.getByTestId(ids.facet.popover.country).last();

    // Country popover shows Algolia counts (no filters active)
    await countryBtn.click();
    await expectBase(facetItemCount(page, loc.US)).toHaveText("4");
    await expectBase(facetItemCount(page, loc.Kenya)).toHaveText("1");

    // Select Kenya → 1 job
    await clickFacetCheckbox(popover, loc.Kenya);
    await play.waitForNetworkIdle();
    await expectBase(jobCards).toHaveCount(1);

    // Select Berkeley (city) → OR → Kenya + Berkeley
    await page.keyboard.press("Escape");
    await expectBase(popover).not.toBeVisible();
    await page.getByTestId(ids.facet.popover.city).last().click();
    await clickFacetCheckbox(popover, loc.BerkeleyCa);
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
