import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("HN Comments", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);

    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: true,
      is_create_single_review: true, // todo ? refac(perf): drop
    });
    $ = play.locator();
  });

  // takes 36s on avg
  test("view imported HN post with tree-structured comments", async () => {
    await play.navigate(urls.posts.list, { idleWait: true });

    // unhide HN Post which has old .created_at_external
    await $[ids.post.listControls.dateRange].getByText("All").click();
    await play.waitForNetworkIdle();

    await play
      .getAll(ids.post.card.container)
      .filter({ hasText: "blog.archive.org" })
      .getByTestId(ids.post.card.link.detail)
      .click();
    await play.waitForNetworkIdle();

    // Wait for delayed load
    await expect($[ids.comment.thread.container]).toBeVisible();

    const threadCount = await play.getAll(ids.comment.thread.container).count();
    expect(threadCount).toBeGreaterThan(0);

    await expect($[ids.comment.thread.line]).toBeVisible();
  });
});
