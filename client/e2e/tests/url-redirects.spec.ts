import { expect, test } from "@playwright/test";
import { ids } from "@/e2e/ids";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { env } from "@/env";
import { urls } from "@/urls";

test.describe("URL redirects and 404", () => {
  test("redirects /job-posting/:slug to current-site jobs slug url", async ({ page }) => {
    const play = new PlaywrightHelper(page);
    const slug = "some-old-slug";

    await play.navigate(`/job-posting/${slug}`);

    await expect(page).toHaveURL(new RegExp(`${urls.jobs.slug(slug)}$`));
  });

  test("renders 404 page on unmatched routes", async ({ page }) => {
    const play = new PlaywrightHelper(page);
    // pg site catches single-segment paths via `/:slug`, hence multi-segment
    const path = env.site.isProbablyGood ? "/no/such/page" : "/no-such-page";

    await play.navigate(path);

    await expect(page.getByText("404")).toBeVisible();
  });

  test("/jobs renders job list on both sites", async ({ page }) => {
    const play = new PlaywrightHelper(page);

    await play.navigate("/jobs");

    await expect(page).toHaveURL(/\/jobs$/);
    await expect(play.$[ids.job.list]).toBeVisible();
  });

  test("pg legacy /:slug soft-swaps URL bar to /jobs/:slug", async ({ page }) => {
    test.skip(!env.site.isProbablyGood, "pg-only legacy route");
    const play = new PlaywrightHelper(page);
    const slug = "some-slug";

    await play.navigate(`/${slug}`);

    await expect(page).toHaveURL(new RegExp(`/jobs/${slug}$`));
    await expect(play.$[ids.job.list]).toBeVisible();
  });
});
