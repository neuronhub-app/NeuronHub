import { test } from "@playwright/test";
import {
  JobVersionsApproveMutation,
  JobVersionsPendingQuery,
} from "@/apps/jobs/versions/queries";
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
  test("shows pending versions and approves them", async () => {
    const queryPending = play.waitForResponseGraphql(JobVersionsPendingQuery);
    await play.navigate(urls.jobs.versions);
    const response = await queryPending;

    const versions = response.data.job_versions_pending;
    expect(versions.length).toBeGreaterThan(0);

    await expect($[ids.job.versions.container]).toBeVisible();
    await expect($[ids.job.versions.card]).toBeVisible();

    // Select all and approve
    await play.click(ids.job.versions.selectAllCheckbox);

    const mutationApprove = play.waitForResponseGraphql(JobVersionsApproveMutation);
    await play.click(ids.job.versions.approveBtn);
    await mutationApprove;

    // After approval, list should be empty
    await expect($[ids.job.versions.emptyState]).toBeVisible();
  });
});
