/**
 * #AI
 */
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/user/how-to/algolia",
  "/user/how-to/analytics",
  "/user/how-to/deploy",
  "/development/how-to/git-commits",
  "/user/how-to/job-emails-sending",
  "/user/how-to/sentry",
  "/user/reference/job-subscription-emails",
];

for (const route of routes) {
  test(`${route} renders without errors`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("text=Application Error")).not.toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();
  });
}

test("TOC renders headings from MDX content", async ({ page }) => {
  await page.goto("/user/how-to/analytics");
  const toc = page.locator("nav", { hasText: "On this page" });
  await expect(toc).toBeVisible();
  await expect(toc.locator("a")).toHaveCount(3);
  await expect(toc.locator("a").first()).toHaveText("Jobs Subscription");
});

test("TOC highlights first heading on page load", async ({ page }) => {
  await page.goto("/user/how-to/deploy");
  const toc = page.locator("nav", { hasText: "On this page" });

  await expect(toc.locator("a", { hasText: "Docker Compose" })).toHaveAttribute(
    "data-current",
    "true",
  );
});

test("TOC click updates URL hash", async ({ page }) => {
  await page.goto("/user/how-to/deploy");
  const toc = page.locator("nav", { hasText: "On this page" });

  await toc.locator("a", { hasText: "Algolia setup" }).click();
  await page.waitForTimeout(600);

  await expect(page).toHaveURL(/.*#algolia-setup$/);
});

test("TOC highlights all visible headings, not just one", async ({ page }) => {
  await page.goto("/user/how-to/deploy");
  const toc = page.locator("nav", { hasText: "On this page" });

  await toc.locator("a", { hasText: "S3 server" }).click();
  await page.waitForTimeout(600);

  const linksActive = toc.locator("a[data-current]");
  await expect(linksActive).toHaveCount(3);
  await expect(toc.locator("a", { hasText: "S3 server" })).toHaveAttribute(
    "data-current",
    "true",
  );
  await expect(toc.locator("a", { hasText: "Rclone" })).toHaveAttribute("data-current", "true");
  await expect(toc.locator("a", { hasText: "Algolia setup" })).toHaveAttribute(
    "data-current",
    "true",
  );
});

test("TOC does not highlight off-screen headings", async ({ page }) => {
  await page.goto("/user/how-to/deploy");
  const toc = page.locator("nav", { hasText: "On this page" });

  await toc.locator("a", { hasText: "S3 server" }).click();
  await page.waitForTimeout(600);

  await expect(toc.locator("a", { hasText: "Docker Compose" })).not.toHaveAttribute(
    "data-current",
    "true",
  );
});

test("Sidebar renders navigation tree from file structure", async ({ page }) => {
  await page.goto("/user/how-to/deploy");

  const sidebar = page.locator("[data-sidebar]");
  await expect(sidebar.getByRole("heading", { name: "How To" })).toBeVisible();
  await expect(sidebar.getByRole("heading", { name: "Reference" })).toBeVisible();

  await expect(sidebar.locator("a", { hasText: "Algolia" })).toBeVisible();
  await expect(sidebar.locator("a", { hasText: "Deploy" })).toBeVisible();
  await expect(sidebar.locator("a", { hasText: "Sentry" })).toBeVisible();
  await expect(sidebar.locator("a", { hasText: "Job Subscription Emails" })).toBeVisible();
});

test("Sidebar highlights active link for current page", async ({ page }) => {
  await page.goto("/user/how-to/deploy");

  const sidebar = page.locator("[data-sidebar]");
  await expect(sidebar.locator("a[data-current]")).toHaveCount(1);
  await expect(sidebar.locator("a[data-current]")).toHaveText("Deploy");
});

test("Sidebar active link changes on navigation", async ({ page }) => {
  await page.goto("/user/how-to/sentry");

  const sidebar = page.locator("[data-sidebar]");
  await expect(sidebar.locator("a[data-current]")).toHaveText("Sentry");
});

test("Sidebar shows NeuronHub logo linking to client URL", async ({ page }) => {
  await page.goto("/");

  const sidebar = page.locator("[data-sidebar]");
  const logo = sidebar.locator("a[aria-label='NeuronHub']");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("href", /http/);
  await expect(logo.locator("text=NeuronHub")).toBeVisible();
  await expect(logo.locator("text=Alpha")).toBeVisible();
});

test("Sidebar shows Usage and Development tabs", async ({ page }) => {
  await page.goto("/");

  const sidebar = page.locator("[data-sidebar]");
  await expect(sidebar.locator("button", { hasText: "Usage" })).toBeVisible();
  await expect(sidebar.locator("button", { hasText: "Development" })).toBeVisible();
});

test("Sidebar tab switch navigates to first page of that section", async ({ page }) => {
  await page.goto("/user/how-to/deploy");

  const sidebar = page.locator("[data-sidebar]");
  await expect(sidebar.locator("button", { hasText: "Usage" })).toHaveAttribute(
    "data-selected",
    "",
  );

  await sidebar.locator("button", { hasText: "Development" }).click();
  await expect(page).toHaveURL(/\/development\/how-to\/git-commits$/);

  await sidebar.locator("button", { hasText: "Usage" }).click();
  await expect(page).toHaveURL(/\/user\/how-to\/algolia$/);
});

test("Dir URL redirects to first child page", async ({ page }) => {
  await page.goto("/development/how-to");
  await expect(page).toHaveURL(/\/development\/how-to\/git-commits$/);
});

test("Dir URL with trailing slash redirects when no README", async ({ page }) => {
  await page.goto("/development/how-to/");
  await expect(page).toHaveURL(/\/development\/how-to\/git-commits$/);
});

test("Section dir URL redirects to first child page", async ({ page }) => {
  await page.goto("/user");
  await expect(page).toHaveURL(/\/user\/how-to\/algolia$/);
});

test("ImageZoom renders thumbnail and opens lightbox on click", async ({ page }) => {
  await page.goto("/user/how-to/sentry");

  const thumbnail = page.locator("img[alt='Sentry Explore Replays']");
  await expect(thumbnail).toBeVisible();
  await page.screenshot({ path: "e2e/test-results/image-zoom-thumbnail.png" });

  await thumbnail.click();
  const backdrop = page.locator("[data-scope='dialog'][data-part='backdrop']");
  await expect(backdrop).toBeVisible();
  await page.screenshot({ path: "e2e/test-results/image-zoom-lightbox.png" });

  await page.keyboard.press("Escape");
  await expect(backdrop).not.toBeVisible();
});
