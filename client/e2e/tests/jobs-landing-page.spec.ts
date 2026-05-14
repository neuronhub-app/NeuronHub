/**
 * #AI-slop
 *
 * Prefetch JSON (consumed by `[slug].tsx`) is gitignored — `beforeEach` writes
 * it from the same constants used for DB seeding, keeping FE↔BE in sync.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect as expectBase } from "@playwright/test";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";
import { TagCategoryEnum } from "~/graphql/enums";

const slug = "e2e-climate-jobs";
const title = "Climate Jobs (e2e)";
const metaDescription = "Latest climate jobs around the world.";
const jobTitle = "Climate Researcher";
const tagName = "Climate Change";

const prefetchJsonPath = fileURLToPath(
  new URL("../../graphql/prefetch/JobsLandingPages.json", import.meta.url),
);

test.skip(!env.site.isProbablyGood, "Landing pages are PG-only");

test.describe("PG Jobs Landing Page", () => {
  test.beforeEach(async ({ play }) => {
    await writeFile(
      prefetchJsonPath,
      `${JSON.stringify(
        {
          jobs_landing_pages: [
            {
              slug,
              title,
              meta_description: metaDescription,
              meta_image_url: "",
              salary_min: null,
              is_orgs_highlighted: null,
              // `category_name` is the lowercase data value (BE wire format),
              // not the gql-enum name (`TagCategoryEnum.Area === "Area"`).
              tags: [{ name: tagName, category_name: "area" }],
              locations: [],
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
    await play.reset_db_and_gen([
      {
        jobs_landing_page: {
          slug,
          title,
          meta_description: metaDescription,
          tags: [{ name: tagName, category: TagCategoryEnum.Area }],
        },
      },
      {
        jobs_job: {
          title: jobTitle,
          tags: [{ name: tagName, category: TagCategoryEnum.Area }],
        },
      },
      { jobs_job: { title: "Unrelated Engineer" } },
    ]);
  });

  test("renders title + preset filter chip + filtered jobs", async ({ page, play }) => {
    await play.navigate(urls.jobs.landingPage(slug), { idleWait: true });

    await expectBase(play.get(ids.job.landingPage.title)).toHaveText(title);
    await expectBase(page).toHaveTitle(`${title} | ${env.VITE_PROJECT_NAME}`);

    // Replaces dropped pytest field-shape test: prove `meta_description`
    // flows BE→prefetch JSON→hero render & `<meta name="description">`.
    await expectBase(page.getByText(metaDescription)).toBeVisible();
    await expectBase(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      metaDescription,
    );

    // `:visible` — the testid also exists on the hidden mobile `PgMobileCollapsible` copy (first in DOM).
    const activeChip = page.locator(`[data-testid="${ids.facet.activeTag(tagName)}"]:visible`);
    await expectBase(activeChip).toBeVisible();

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(1);
    await expectBase(jobCards.first()).toContainText(jobTitle);

    // Initial URL is clean (preset state ≡ `stateMapping.stateToRoute(preset) → {}`).
    expectBase(new URL(page.url()).search).toBe("");

    // Removing the only preset chip → state empty → `FiltersResetRedirect` → /jobs homepage.
    await activeChip.click();
    await expectBase(page).toHaveURL(urls.jobs.list);
  });
});
