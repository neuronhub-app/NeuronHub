import { UserQueryDoc } from "@/apps/users/useUserCurrent";
import { ToggleFollowUserSourceMutation } from "@/components/posts/PostCard/PostAuthor";
import { expect } from "@/e2e/helpers/expect";
import type { LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

const postIdHn = 45487476;

test.describe("Follow HN user source", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([{ posts_import_hn: { id_external: postIdHn } }]);
  });

  test("toggle follow from PostAuthor popover (flaky)", async ({ play, $ }) => {
    test.slow();
    play.setDefaultTimeout(12_000);

    await openListWithHnPost(play, $);

    // open popover: first hover to mount the Trigger, then click the username
    let username = play.get(ids.post.author.username);
    await expect(username).toBeVisible();
    await username.hover();
    await username.click();

    await expect($[ids.post.author.follow]).toHaveText("Follow");

    const mutation = play.waitForResponseGraphql(ToggleFollowUserSourceMutation);
    const userRefetch = play.waitForResponseGraphql(UserQueryDoc);
    await $[ids.post.author.follow].click();
    await mutation;
    await userRefetch;

    await expect($[ids.post.author.follow]).toHaveText("Unfollow");

    await play.screenshot("follow-user-source");

    await play.reload({ idleWait: true });
    await openListWithHnPost(play, $, { isAlreadyOnList: true });

    username = play.get(ids.post.author.username);
    await expect(username).toBeVisible();
    await username.hover();
    await username.click();
    await expect($[ids.post.author.follow]).toHaveText("Unfollow");
  });
});

async function openListWithHnPost(
  play: PlaywrightHelper,
  $: LocatorMapToGetFirstById,
  opts: { isAlreadyOnList?: boolean } = {},
) {
  if (!opts.isAlreadyOnList) {
    await play.navigate(urls.posts.list, { idleWait: true });
  }
  // unhide HN Post with old .created_at_external
  await $[ids.post.listControls.dateRange].getByText("All").click();
  await play.waitForNetworkIdle();
}
