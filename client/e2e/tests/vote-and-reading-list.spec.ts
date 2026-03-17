import { test } from "@playwright/test";
import { UserQueryDoc } from "@/apps/users/useUserCurrent";
import { expect } from "@/e2e/helpers/expect";
import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids, type TestId } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("Post - action button", () => {
  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.locator();
    await play.dbStubsRepopulateAndLogin({
      is_import_HN_post: false,
      is_create_single_review: true,
    });
  });

  test("Upvote", async () => {
    await clickAndTestState(ids.post.vote.up);
  });

  test("Add to Reading List", async () => {
    await clickAndTestState(ids.post.btn.readingList);
  });

  async function clickAndTestState(btnId: TestId) {
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
