import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids, type TestId } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Post - action button", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Upvote", async ({ page }) => {
    await clickAndTestState(ids.post.vote.up);
  });

  test("Add to Reading List", async ({ page }) => {
    await clickAndTestState(ids.post.btn.readingList);
  });

  async function clickAndTestState(btnId: TestId) {
    await helper.navigate(urls.reviews.list);

    const button = helper.get(btnId);
    await expect(button).toBeVisible();

    await expect(button).not.checked();

    const mutation = helper.awaitMutation("UserCurrent");
    await button.click();
    await mutation;
    await expect(button).checked();

    await helper.reload();
    await expect(button).checked();
  }
});
