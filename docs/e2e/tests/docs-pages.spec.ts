import { expect, type Locator, type Page, test } from "@playwright/test";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { href } from "react-router";

const routes = {
  home: path("/"),
  user: {
    algolia: path("/user/guides/algolia"),
    analytics: path("/user/guides/analytics"),
    deploy: path("/user/guides/deploy"),
    jobEmails: path("/user/guides/job-emails-sending"),
    sentry: path("/user/guides/sentry"),
    jobSubscription: path("/user/reference/job-subscription-emails"),
    dir: path("/user"),
  },
  development: {
    gitCommits: path("/development/guides/git-commits"),
    dirGuides: path("/development/guides"),
  },
};

const routesAll = [
  routes.home,
  ...Object.values(routes.user),
  ...Object.values(routes.development),
];

for (const url of routesAll) {
  test(`${url} renders without errors`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByText("Application Error")).not.toBeVisible();
  });
}

test.describe("TOC", () => {
  test("renders headings from MDX content", async ({ page }) => {
    await page.goto(routes.user.analytics);
    await expect($(page)[ids.toc.root]).toBeVisible();
    await expect(tocLinks(page)).toHaveCount(3);
  });

  test("highlights first heading on page load", async ({ page }) => {
    await page.goto(routes.user.deploy);
    await expect(linksActive($(page)[ids.toc.root]).first()).toBeVisible();
  });

  test("click updates URL hash", async ({ page }) => {
    await page.goto(routes.user.deploy);
    await tocLinks(page).nth(5).click();
    await expect(page).toHaveURL(/#.+$/);
  });

  test("highlights multiple visible headings", async ({ page }) => {
    await page.goto(routes.user.deploy);
    await tocLinks(page).nth(3).click();
    await expect(linksActive($(page)[ids.toc.root])).not.toHaveCount(1);
  });

  test("does not highlight off-screen headings", async ({ page }) => {
    await page.goto(routes.user.deploy);
    await tocLinks(page).nth(3).click();
    await expect(linksActive($(page)[ids.toc.root])).not.toHaveCount(0);
    await expect(tocLinks(page).first()).not.toHaveAttribute("data-current");
  });
});

test.describe("Sidebar", () => {
  test("renders navigation groups", async ({ page }) => {
    await page.goto(routes.user.deploy);
    const nav = $(page)[ids.sidebar.root];
    await expect(nav.getByRole("heading")).not.toHaveCount(0);
    await expect(nav.getByRole("link")).not.toHaveCount(0);
  });

  test("highlights exactly one active link", async ({ page }) => {
    await page.goto(routes.user.deploy);
    await expect(linksActive($(page)[ids.sidebar.root])).toHaveCount(1);
  });

  test("active link changes on navigation", async ({ page }) => {
    await page.goto(routes.user.deploy);
    const nav = $(page)[ids.sidebar.root];
    const textFirst = await linksActive(nav).textContent();

    await page.goto(routes.user.sentry);
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

  test("tab switch navigates between sections", async ({ page }) => {
    await page.goto(routes.user.deploy);
    const tabs = $(page)[ids.sidebar.root].getByRole("tab");

    await expect(tabs.first()).toHaveAttribute("data-selected", "");
    await tabs.last().click();
    await expect(page).toHaveURL(new RegExp(routes.development.gitCommits));

    await tabs.first().click();
    await expect(page).toHaveURL(new RegExp(routes.user.algolia));
  });
});

test.describe("Dir redirects", () => {
  test("dir URL redirects to child page", async ({ page }) => {
    await page.goto(routes.development.dirGuides);
    await expect(page).toHaveURL(new RegExp(`${routes.development.dirGuides}/.+`));
  });

  test("section URL redirects to child page", async ({ page }) => {
    await page.goto(routes.user.dir);
    await expect(page).toHaveURL(new RegExp(`${routes.user.dir}/.+`));
  });
});

test("ImageZoom opens lightbox on thumbnail click", async ({ page }) => {
  await page.goto(routes.user.sentry);
  const thumbnail = page.getByRole("img").first();
  await expect(thumbnail).toBeVisible();

  await thumbnail.click();
  await expect($(page)[ids.imageZoom.backdrop]).toBeVisible();

  await page.keyboard.press("Escape");
  await expect($(page)[ids.imageZoom.backdrop]).not.toBeVisible();
});

// --- helpers ---

function path(path: Parameters<typeof href>[0]) {
  return href(path);
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
