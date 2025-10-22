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

  test("view imported HN post with comments", async () => {
    await play.navigate(urls.posts.list, { idleWait: true });
    // the first post is imported from HN
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    await $[ids.comment.btn.reply].click();
    await $[ids.comment.form.textarea].isVisible();
    // see at client/e2e/screenshots/1-page-long.png
    // await play.screenshot("page-long", { fullPage: true });
  });
});
