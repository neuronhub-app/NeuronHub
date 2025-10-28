import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

// #AI-slop
test.describe("Library - Highlights", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    const timeoutExtra = 7000;
    play = new PlaywrightHelper(page, timeoutExtra);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("renders highlights from fixtures", async ({ page }) => {
    // Navigate to Library page
    await page.goto(urls.library);
    await play.waitForNetworkIdle();

    // Check that the page title is correct
    await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();

    // Verify highlights are displayed
    // We have 2 highlights from db_stubs_repopulate:
    // 1. "superior debugging and refactoring capabilities" from PyCharm comment
    // 2. "GPU rendering option" from iTerm2 comment

    // Check that both highlights are rendered as <mark> elements
    const highlightMarks = page.locator(`mark[data-testid="${ids.highlighter.span}"]`);
    await expect(highlightMarks).toHaveCount(2);

    // Verify the highlighted texts are present (order may vary based on database)
    await expect(highlightMarks.first()).toBeVisible();
    await expect(highlightMarks.last()).toBeVisible();

    // Check that both texts are present somewhere
    const allTexts = await highlightMarks.allTextContents();
    const trimmedTexts = allTexts.map(t => t.trim());
    expect(trimmedTexts).toContain("superior debugging and refactoring capabilities");
    expect(trimmedTexts).toContain("GPU rendering option");

    // Check that the highlighted comment sections are displayed
    await expect(page.locator("text=Highlighted Comment")).toHaveCount(2);

    // Verify some content is displayed (don't check exact text since it may be truncated)
    await expect(page.getByText("VS Code", { exact: false })).toBeVisible();
    await expect(page.getByText("GPU rendering", { exact: false })).toBeVisible();

    // Verify the highlight styling is applied (basic check)
    const backgroundColor = await highlightMarks.first().evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(backgroundColor).toBeTruthy();
    expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)"); // Not transparent
  });

  test("library link is active in sidebar", async ({ page }) => {
    // Navigate to Library page
    await page.goto(urls.library);
    await play.waitForNetworkIdle();

    // Check that library link in sidebar has aria-current="page"
    const libraryLink = page.locator(`a[href="${urls.library}"]`).first();
    await expect(libraryLink).toHaveAttribute("aria-current", "page");
  });
});
