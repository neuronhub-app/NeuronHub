import { JobDraftsApproveMutation, JobDraftsQuery } from "@/apps/jobs/drafts/queries";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

test.describe("JobVersionReview", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      { jobs_job: { is_published: false } },
      { jobs_job: { is_published: false } },
    ]);
  });

  test("shows pending drafts and approves them", async ({ play, $ }) => {
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
