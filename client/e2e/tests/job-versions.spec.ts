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
    const queryPending = play.waitForResponseGraphql(JobDraftsQuery);
    await play.navigate(urls.jobs.drafts);
    const response = await queryPending;

    const versions = response.data.job_versions_pending;
    expect(versions.length).toBeGreaterThan(0);

    await expect($[ids.job.drafts.container]).toBeVisible();
    await expect($[ids.job.drafts.card]).toBeVisible();

    // Select all and approve
    await play.click(ids.job.drafts.selectAllCheckbox);

    const mutationApprove = play.waitForResponseGraphql(JobDraftsApproveMutation);
    await play.click(ids.job.drafts.approveBtn);
    await mutationApprove;

    // After approval, list should be empty
    await expect($[ids.job.drafts.emptyState]).toBeVisible();
  });
});
