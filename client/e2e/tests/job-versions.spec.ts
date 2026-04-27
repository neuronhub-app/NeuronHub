import { JobDraftsApproveMutation, JobDraftsQuery } from "@/apps/jobs/drafts/queries";
import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("JobVersionReview", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    test.slow();

    play = new PlaywrightHelper(page);
    $ = play.$;
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: false,
      is_create_jobs: true,
    });
  });

  // #AI
  test("shows pending drafts and approves them", async () => {
    // beforeEach `dbStubsRepopulateAndLogin` + Algolia reindex
    // alone burns ~50s, leaving <5s of the 55s default budget.
    test.slow();

    const queryPending = play.waitForResponseGraphql(JobDraftsQuery);
    await play.navigate(urls.jobs.drafts);
    const response = await queryPending;

    const versions = response.data.job_versions_pending;
    expect(versions.length).toBeGreaterThan(0);

    await expect($[ids.job.drafts.container]).toBeVisible();
    await expect($[ids.job.drafts.card]).toBeVisible();

    await play.click(ids.job.drafts.selectAllCheckbox);
    await expect($[ids.job.drafts.approveBtn]).toBeEnabled();

    const mutationApprove = play.waitForResponseGraphql(JobDraftsApproveMutation);
    const queryRefetch = play.waitForResponseGraphql(JobDraftsQuery);
    await play.click(ids.job.drafts.approveBtn);
    await mutationApprove;
    await queryRefetch;

    await expect($[ids.job.drafts.emptyState]).toBeVisible();
  });
});
