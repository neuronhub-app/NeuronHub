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

const pages = {
  climate_change: {
    slug: "e2e-climate-jobs",
    title: "Climate Jobs (e2e)",
    subtitle: "Find jobs fighting climate change.",
    meta_title: "Climate Jobs | NeuronHub e2e",
    meta_description: "Latest climate jobs around the world.",
    job_title: "Climate Researcher",
    tag_name: "Climate Change",
  },
  charity_entrepreneurship: {
    slug: "e2e-aim-jobs",
    title: "AIM Jobs (e2e)",
    source_ext: "AIM",
    job_title: "AIM-sourced Researcher",
  },
} as const;

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
              slug: pages.climate_change.slug,
              title: pages.climate_change.title,
              subtitle: pages.climate_change.subtitle,
              meta_title: pages.climate_change.meta_title,
              meta_description: pages.climate_change.meta_description,
              meta_image_url: "",
              salary_min: null,
              is_orgs_highlighted: null,
              source_ext: null,
              // `category_name` is the lowercase data value (BE wire format),
              // not the gql-enum name (`TagCategoryEnum.Area === "Area"`).
              tags: [{ name: pages.climate_change.tag_name, category_name: "area" }],
              locations: [],
            },
            {
              slug: pages.charity_entrepreneurship.slug,
              title: pages.charity_entrepreneurship.title,
              subtitle: "",
              meta_title: "",
              meta_description: "",
              meta_image_url: "",
              salary_min: null,
              is_orgs_highlighted: null,
              source_ext: pages.charity_entrepreneurship.source_ext,
              tags: [],
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
          slug: pages.climate_change.slug,
          title: pages.climate_change.title,
          subtitle: pages.climate_change.subtitle,
          meta_title: pages.climate_change.meta_title,
          meta_description: pages.climate_change.meta_description,
          tags: [{ name: pages.climate_change.tag_name, category: TagCategoryEnum.Area }],
        },
      },
      {
        jobs_landing_page: {
          slug: pages.charity_entrepreneurship.slug,
          title: pages.charity_entrepreneurship.title,
          source_ext: pages.charity_entrepreneurship.source_ext,
        },
      },
      {
        jobs_job: {
          title: pages.climate_change.job_title,
          tags: [{ name: pages.climate_change.tag_name, category: TagCategoryEnum.Area }],
        },
      },
      {
        jobs_job: {
          title: pages.charity_entrepreneurship.job_title,
          source_ext: pages.charity_entrepreneurship.source_ext,
        },
      },
      { jobs_job: { title: "Unrelated Engineer" } },
    ]);
  });

  test("source_ext preset filters jobs + chip resets to /jobs", async ({ page, play }) => {
    await play.navigate(urls.jobs.landingPage(pages.charity_entrepreneurship.slug), {
      idleWait: true,
    });

    await expectBase(play.get(ids.job.landingPage.title)).toHaveText(
      pages.charity_entrepreneurship.title,
    );

    const sourceChip = page.locator(
      `[data-testid="${ids.facet.activeTag(`Source: ${pages.charity_entrepreneurship.source_ext}`)}"]:visible`,
    );
    await expectBase(sourceChip).toBeVisible();

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(1);
    await expectBase(jobCards.first()).toContainText(pages.charity_entrepreneurship.job_title);

    expectBase(new URL(page.url()).search).toBe("");

    await sourceChip.click();
    await expectBase(page).toHaveURL(urls.jobs.list);
  });

  test("renders title + preset filter chip + filtered jobs", async ({ page, play }) => {
    await play.navigate(urls.jobs.landingPage(pages.climate_change.slug), { idleWait: true });

    await expectBase(play.get(ids.job.landingPage.title)).toHaveText(pages.climate_change.title);
    await expectBase(page).toHaveTitle(
      `${pages.climate_change.meta_title} | ${env.VITE_PROJECT_NAME}`,
    );

    // Replaces dropped pytest field-shape test: prove `subtitle`/`meta_description`
    // flow BE→prefetch JSON→hero render & `<meta name="description">`.
    await expectBase(page.getByText(pages.climate_change.subtitle)).toBeVisible();
    await expectBase(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      pages.climate_change.meta_description,
    );

    // `:visible` — the testid also exists on the hidden mobile `PgMobileCollapsible` copy (first in DOM).
    const activeChip = page.locator(
      `[data-testid="${ids.facet.activeTag(pages.climate_change.tag_name)}"]:visible`,
    );
    await expectBase(activeChip).toBeVisible();

    const jobCards = play.getAll(ids.job.card.container);
    await expectBase(jobCards).toHaveCount(1);
    await expectBase(jobCards.first()).toContainText(pages.climate_change.job_title);

    // Initial URL is clean (preset state ≡ `stateMapping.stateToRoute(preset) → {}`).
    expectBase(new URL(page.url()).search).toBe("");

    // Removing the only preset chip → state empty → `FiltersResetRedirect` → /jobs homepage.
    await activeChip.click();
    await expectBase(page).toHaveURL(urls.jobs.list);
  });
});
