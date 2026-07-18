import { expect as expectBase, type Locator } from "@playwright/test";

import { TagCategoryEnum } from "~/graphql/enums";

import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { explainers } from "@/sites/pg/pages/jobs/explainers";
import { urls } from "@/urls";

const causeArea = "Career-Capital";

test.skip(!env.site.isProbablyGood, "Explainers are PG-only");

test.describe("PG Jobs Explainers", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      {
        jobs_job: {
          title: "Career Capital Role",
          tags: [{ name: causeArea, category: TagCategoryEnum.Area }],
        },
      },
    ]);
  });

  test("hover shows explainer on card badge + cause-area checkbox", async ({ page, play }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const cardBadge = play.get(ids.job.card.tag("tags_area"));
    await hover(cardBadge);
    await expectBase(page.getByText(explainers.careerCapital.card)).toBeVisible({
      timeout: 8_000,
    });
    await play.screenshot("pg-jobs-explainer-card");

    await page.getByTestId(ids.facet.popover.causeArea).last().click();
    await play.waitForNetworkIdle();
    const checkbox = page.getByTestId(ids.facet.checkbox(causeArea));
    await expectBase(checkbox.locator("p").last()).toHaveText("1");
    await hover(checkbox.getByText(causeArea));
    await expectBase(page.getByText(explainers.careerCapital.menu)).toBeVisible({
      timeout: 8_000,
    });
    await play.screenshot("pg-jobs-explainer-menu");
  });
});

async function hover(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
}
