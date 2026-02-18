import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("PostListAlgolia", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.$;
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: true,
      is_create_single_review: false,
    });
  });

  // #AI stupid and wrong
  test("sort control changes actual post order", async ({ page }) => {
    await play.navigate(urls.posts.list, { idleWait: true });

    // Show all posts to have more data
    await play.get(ids.post.listControls.dateRange).getByText("All").click();
    await play.waitForNetworkIdle();

    // Get post IDs in "Latest" order (default)
    const getPostIds = async () => {
      const cards = page.getByTestId(ids.post.card.container);
      const count = await cards.count();
      const postIds: string[] = [];
      for (let i = 0; i < count; i++) {
        const id = await cards.nth(i).getAttribute("data-id");
        if (id) postIds.push(id);
      }
      return postIds;
    };

    const latestOrder = await getPostIds();
    expect(latestOrder.length).toBeGreaterThan(1);

    // Switch to "Votes" sort
    await play.get(ids.post.listControls.sort).getByText("Newest").click();
    await play.waitForNetworkIdle();

    const votesOrder = await getPostIds();
    expect(votesOrder.length).toBeGreaterThan(1);

    // The orders should be different - if identical, sorting isn't working
    // Compare as strings to check order, not just content
    const latestOrderStr = latestOrder.join(",");
    const votesOrderStr = votesOrder.join(",");
    expect(votesOrderStr).not.toBe(latestOrderStr);

    // Switch back to Latest - first few posts should match original order
    await play.get(ids.post.listControls.sort).getByText("Best").click();
    await play.waitForNetworkIdle();

    const backToLatestOrder = await getPostIds();
    // Compare first 3 posts to handle async loading differences
    const compareCount = Math.min(3, latestOrder.length);
    expect(backToLatestOrder.slice(0, compareCount).join(",")).toBe(
      latestOrder.slice(0, compareCount).join(","),
    );
  });

  test("date filter excludes old posts", async ({ page }) => {
    await play.navigate(urls.posts.list, { idleWait: true });

    // trigger state change from the "7d" default
    await $[ids.post.listControls.dateRange].getByText("All").click();
    await play.waitForNetworkIdle();
    const countAll = await getPostCount();

    // "1d" <= "All" posts
    await $[ids.post.listControls.dateRange].getByText("7d").click();
    await play.waitForNetworkIdle();
    const count7d = await getPostCount();
    expect(count7d).toBeLessThanOrEqual(countAll);

    async function getPostCount() {
      return page.getByTestId(ids.post.card.container).count();
    }
  });
});
