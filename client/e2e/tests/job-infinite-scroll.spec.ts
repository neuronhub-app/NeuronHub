import { expect as expectBase } from "@playwright/test";

import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

const jobsSeeded = 15;
const hitsPerPage = 10;

test.skip(!env.site.isProbablyGood, "Infinite scroll is PG-only");

test.describe("PG Jobs Infinite Scroll", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen(Array.from({ length: jobsSeeded }, () => ({ jobs_job: {} })));
  });

  test("Scroll to the bottom loads the next page", async ({ play }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(hitsPerPage);

    await jobCards.last().scrollIntoViewIfNeeded();

    await expectBase(jobCards).toHaveCount(jobsSeeded);
  });

  test("The `Load more` button loads the last page, then hides itself", async ({ play }) => {
    await play.navigate(urls.jobs.list, { idleWait: true });

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(hitsPerPage);

    await play.click(ids.job.btn.loadMore);

    await expectBase(jobCards).toHaveCount(jobsSeeded);
    await expectBase(play.get(ids.job.btn.loadMore)).not.toBeVisible();
  });
});
