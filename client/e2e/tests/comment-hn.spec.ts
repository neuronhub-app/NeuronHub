import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("HN Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    page.on("console", msg => {
      const text = msg.text();
      if (text.includes("[PostDetail]")) {
        console.log(`[BROWSER] ${text}`);
      }
    });

    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: true,
      is_create_single_review: true,
    });
    $ = play.locator();
  });

  // #AI
  test("view imported HN post with tree-structured comments", async () => {
    await play.navigate(urls.posts.list, { idleWait: true });

    // unhide HN Post which has old .created_at_external
    await play.get(ids.post.listControls.dateRange).getByText("All").click();
    await play.waitForNetworkIdle();

    const hnPostCard = play.page.getByTestId(ids.post.card.container).filter({
      hasText: "HackerNews",
    });
    await hnPostCard.getByTestId(ids.post.card.link.detail).click();
    await play.waitForNetworkIdle();

    // Wait for comments to load (dynamic batch loading)
    const threadContainers = play.getAll(ids.comment.thread.container);
    await expect(threadContainers.first()).toBeVisible();

    const containerCount = await threadContainers.count();
    expect(containerCount).toBeGreaterThan(0);
    console.log(`Thread containers: ${containerCount}`);

    const allThreadLines = play.getAll(ids.comment.thread.line);
    await expect(allThreadLines.first()).toBeVisible();
  });
});
