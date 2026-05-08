import { UserQueryDoc } from "@/apps/users/useUserCurrent";
import { expect } from "@/e2e/helpers/expect";
import type { LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids, type TestId } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

test.describe("Post - action button", () => {
  test.beforeEach(async ({ play }) => {
    const tool = "PyCharm";
    await play.reset_db_and_gen([
      { posts_tool: { title: tool } },
      { posts_review: { parent: tool, title: "Fine review" } },
    ]);
  });

  test("Upvote", async ({ play, $ }) => {
    await clickAndTestState(play, $, ids.post.vote.up);
  });

  test("Add to Reading List", async ({ play, $ }) => {
    await clickAndTestState(play, $, ids.post.btn.readingList);
  });

  async function clickAndTestState(
    play: PlaywrightHelper,
    $: LocatorMapToGetFirstById,
    btnId: TestId,
  ) {
    await play.navigate(urls.reviews.list);

    await expect($[btnId]).toBeVisible();

    await expect($[btnId]).not.checked();

    const mutation = play.waitForResponseGraphql(UserQueryDoc);
    await $[btnId].click();
    await mutation;
    await expect($[btnId]).checked();

    await play.reload();
    await expect($[btnId]).checked();
  }
});
