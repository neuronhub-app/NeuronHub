import { test } from "@playwright/test";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("HN Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  // #AI-slop
  test("view imported HN post with comments", async () => {
    await play.navigate(urls.posts.list, { idleWait: true });
    await play.click(ids.post.card.link.detail); // the Post imported from HN
    await play.waitForNetworkIdle();

    const allThreadLines = play.getAll(ids.comment.thread.line);

    // Test hover on comment with children (depth 1)
    const lineWithChildren = allThreadLines.nth(0);
    await lineWithChildren.hover();
    await play.page.waitForTimeout(200);
    await play.screenshot("hover-depth1-with-children", { fullPage: false });

    // Test hover on childless comment
    const childlessLine = allThreadLines.nth(1);
    await childlessLine.hover();
    await play.page.waitForTimeout(200);
    await play.screenshot("hover-childless", { fullPage: false });

    // Test hover on depth=3 comment
    const depth3Line = allThreadLines.nth(3);
    await depth3Line.hover();
    await play.page.waitForTimeout(200);
    await play.screenshot("hover-depth3", { fullPage: false });

    // Test collapsing functionality
    await lineWithChildren.click();
    await play.page.waitForTimeout(500);
    await play.screenshot("comment-collapsed", { fullPage: false });

    // Test hover on collapsed state (unfolding)
    const collapsedLine = allThreadLines.nth(0);
    await collapsedLine.hover();
    await play.page.waitForTimeout(200);
    await play.screenshot("hover-collapsed-unfolding", { fullPage: false });
  });
});
