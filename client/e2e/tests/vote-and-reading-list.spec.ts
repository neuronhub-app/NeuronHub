import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids, type TestId } from "@/e2e/ids";
import { urls } from "@/urls";

test.describe("Post - action button", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
  });

  test("Upvote", async () => {
    await clickAndTestState(ids.post.vote.up);
  });

  test("Add to Reading List", async () => {
    await clickAndTestState(ids.post.btn.readingList);
  });

  async function clickAndTestState(btnId: TestId) {
    await play.navigate(urls.reviews.list);

    const button = play.get(btnId);
    await expect(button).toBeVisible();

    await expect(button).not.checked();

    const mutation = play.awaitMutation("UserCurrent");
    await button.click();
    await mutation;
    await expect(button).checked();

    await play.reload();
    await expect(button).checked();
  }
});
