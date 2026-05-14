import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

const post_HN_id = 45487476;

test.describe("HN Comments", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([{ posts_import_hn: { id_external: post_HN_id } }]);
  });

  // takes 36s on avg
  test("view imported HN post with tree-structured comments (flaky)", async ({ play, $ }) => {
    test.slow();
    play.setDefaultTimeout(12_000); // 7.5s makes it flaky

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

    // todo ! fix: #AI-slop - use waitForResponseGraphql. And remove/off import of blog.archive.org <meta> (if exists)
    await expect($[ids.comment.thread.container]).toBeVisible();

    const threadCount = await play.getAll(ids.comment.thread.container).count();
    expect(threadCount).toBeGreaterThan(0);

    await expect($[ids.comment.thread.line]).toBeVisible();
  });
});
