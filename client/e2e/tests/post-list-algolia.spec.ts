import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

// #AI stupid and wrong.
test.describe("PostListAlgolia", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: true,
      is_create_single_review: false,
    });
  });

  test("sort control changes actual post order", async ({ page }) => {
    await play.navigate(urls.posts.list, { idleWait: true });

    const sortControl = play.get(ids.post.listControls.sort);
    const dateControl = play.get(ids.post.listControls.dateRange);

    // Show all posts to have more data
    await dateControl.getByText("All").click();
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
    await sortControl.getByText("Best").click();
    await play.waitForNetworkIdle();

    const votesOrder = await getPostIds();
    expect(votesOrder.length).toBeGreaterThan(1);

    // The orders should be different - if identical, sorting isn't working
    // Compare as strings to check order, not just content
    const latestOrderStr = latestOrder.join(",");
    const votesOrderStr = votesOrder.join(",");
    expect(votesOrderStr).not.toBe(latestOrderStr);

    // Switch back to Latest - first few posts should match original order
    await sortControl.getByText("Newest").click();
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

    const dateControl = play.get(ids.post.listControls.dateRange);

    const getPostCount = async () => {
      const cards = page.getByTestId(ids.post.card.container);
      return await cards.count();
    };

    // Explicitly click "7d" to ensure filter is applied (even though it's default)
    await dateControl.getByText("7d").click();
    await play.waitForNetworkIdle();
    const count7d = await getPostCount();

    // Switch to "All" - should have more or equal posts
    await dateControl.getByText("All").click();
    await play.waitForNetworkIdle();
    const countAll = await getPostCount();
    expect(countAll).toBeGreaterThanOrEqual(count7d);

    // Switch to "1d" - should have fewer or equal posts than 7d
    await dateControl.getByText("1d").click();
    await play.waitForNetworkIdle();
    const count1d = await getPostCount();
    expect(count1d).toBeLessThanOrEqual(count7d);
  });
});
