/**
 * #AI
 */
import { expect, type Locator, type Page, test } from "@playwright/test";
import { href } from "react-router";

import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { getPageSlugByFilepath, pagesDir } from "@/getPageSlugByFilepath";
import { findMdxFiles } from "@/utils/findMdxFiles";

const routes = {
  home: href("/"),
  usage: {
    algolia: href("/usage/guides/algolia"),
    deploy: href("/development/guides/deploy"),
    sentry: href("/usage/guides/sentry"),
    dir: href("/usage"),
  },
  development: {
    codeStyle: href("/development/intro/code-style"),
    dirGuides: href("/development/guides"),
  },
};

const allSlugs = ["/", ...findMdxFiles(pagesDir).map(getPageSlugByFilepath)];
for (const slug of allSlugs) {
  test(`loads without errors: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    // client-side errors
    page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));

    // console.error outside of "pageerror"
    page.on("console", msg => {
      if (msg.type() === "error" && isErrorAppRelevant(msg.text())) {
        errors.push(`console: ${msg.text()}`);
      }
    });

    const response = await page.goto(slug);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText("Application Error")).not.toBeVisible();

    // eg Shiki client errors are a dynamic import - wait for it.
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
}

test.describe("TOC", () => {
  test("highlights first heading on page load", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    await expect(linksActive($(page)[ids.toc.root]).first()).toBeVisible();
  });

  test("click updates URL hash", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    await tocLinks(page).nth(2).click();
    await expect(page).toHaveURL(/#.+$/);
  });

  test("does not highlight off-screen headings", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    await tocLinks(page).nth(3).click();
    await expect(linksActive($(page)[ids.toc.root])).not.toHaveCount(0);
    await expect(tocLinks(page).first()).not.toHaveAttribute("data-current");
  });
});

test.describe("Sidebar", () => {
  test("renders navigation groups", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    const nav = $(page)[ids.sidebar.root];
    await expect(nav.getByRole("heading")).not.toHaveCount(0);
    await expect(nav.getByRole("link")).not.toHaveCount(0);
  });

  test("highlights exactly one active link", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    await expect(linksActive($(page)[ids.sidebar.root])).toHaveCount(1);
  });

  test("active link changes on navigation", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    const nav = $(page)[ids.sidebar.root];
    const textFirst = await linksActive(nav).textContent();

    await page.goto(routes.usage.sentry);
    const textSecond = await linksActive(nav).textContent();
    expect(textFirst).not.toEqual(textSecond);
  });

  test("logo links to client URL", async ({ page }) => {
    await page.goto(routes.home);
    const logo = $(page)[ids.sidebar.logo];
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", env.VITE_CLIENT_URL);
  });

  test("shows section tabs", async ({ page }) => {
    await page.goto(routes.home);
    await expect($(page)[ids.sidebar.root].getByRole("tab")).toHaveCount(2);
  });
});

test.describe("Hidden pages", () => {
  test("hidden dir not in sidebar", async ({ page }) => {
    await page.goto(routes.development.codeStyle);
    const nav = $(page)[ids.sidebar.root];
    await expect(nav.getByText("LLM Spec Logs")).not.toBeVisible();
  });
});

test.describe("Site switcher", () => {
  const siteParamPg = "?site=pg";
  const pgLinearLabel = "Linear.app";

  test("pg pages hidden by default, shown after switch, persisted on reload", async ({
    page,
  }) => {
    await page.goto(routes.usage.sentry);
    const nav = $(page)[ids.sidebar.root];

    await expect(nav.getByText(pgLinearLabel)).not.toBeVisible();
    await expect(nav.getByText("Render.com")).not.toBeVisible();

    await $(page)[ids.siteSwitcher.trigger].click();
    await $(page)[ids.siteSwitcher.item("pg")].click();

    await expect(nav.getByText(pgLinearLabel)).toBeVisible();

    await page.reload();
    await expect(nav.getByText(pgLinearLabel)).toBeVisible();
  });

  test("ToC updates its headings when switching site", async ({ page }) => {
    await page.goto(routes.usage.deploy);
    const toc = $(page)[ids.toc.root];

    await expect(toc.getByText("Linear", { exact: true })).not.toBeVisible();

    await $(page)[ids.siteSwitcher.trigger].click();
    await $(page)[ids.siteSwitcher.item("pg")].click();

    await expect(toc.getByText("Linear", { exact: true })).toBeVisible();
  });

  test("?site=pg URL param auto-sets pg", async ({ page }) => {
    await page.goto(routes.usage.sentry + siteParamPg);
    await expect($(page)[ids.sidebar.root].getByText(pgLinearLabel)).toBeVisible();
  });

  test("switching writes ?site=pg to URL", async ({ page }) => {
    await page.goto(routes.usage.sentry);

    await $(page)[ids.siteSwitcher.trigger].click();
    await $(page)[ids.siteSwitcher.item("pg")].click();

    await expect(page).toHaveURL(/[?&]site=pg/);
  });

  test("pg logo shown when pg", async ({ page }) => {
    await page.goto(routes.usage.sentry + siteParamPg);

    const logo = $(page)[ids.sidebar.logo];
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("Probably Good");
    await expect(logo).toContainText("Jobs");
    await expect(logo).toHaveAttribute("href", "https://jobs.probablygood.org/");
  });

  test("?site=pg persists across Usage↔Development tab navigation", async ({ page }) => {
    await page.goto(routes.usage.sentry + siteParamPg);
    await $(page)[ids.sidebar.root].getByRole("tab", { name: "Development" }).click();
    await expect(page).toHaveURL(/[?&]site=pg/);
  });
});

test.describe("Dir redirects", () => {
  test("dir URL redirects to child page", async ({ page }) => {
    await page.goto(routes.development.dirGuides);
    await expect(page).toHaveURL(new RegExp(`${routes.development.dirGuides}/.+`));
  });

  test("section URL redirects to child page", async ({ page }) => {
    await page.goto(routes.usage.dir);
    await expect(page).toHaveURL(new RegExp(`${routes.usage.dir}/.+`));
  });
});

test.describe("<Term/>", () => {
  test("no console.errors with <Term/>", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(routes.usage.algolia);
    expect(errors).toEqual([]);
  });
});

// --- helpers ---

function isErrorAppRelevant(text: string): boolean {
  const isViteDevNoise = text.includes("Outdated Optimize Dep") || text.includes("[vite]");
  return !isViteDevNoise;
}

function $(page: Page): Record<string, Locator> {
  return new Proxy({} as Record<string, Locator>, {
    get: (_, id: string) => page.getByTestId(id).first(),
  });
}

function tocLinks(page: Page) {
  return $(page)[ids.toc.root].locator("a");
}

function linksActive(container: Locator) {
  return container.locator("a[data-current]");
}
