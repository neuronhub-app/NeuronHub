import { test } from "@playwright/test";
import { strs } from "@/apps/posts/detail/PostDetail";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbStubsRepopulateAndLogin();
  });

  // todo !(test) flaky on last state check
  test("post and vote", async ({ page }) => {
    await pwh.navigate(urls.reviews.list);
    await pwh.click(ids.post.card.link);
    await pwh.waitForText("Comments");

    const testComment = "Test comment";
    await pwh.get(ids.comment.form.textarea).fill(testComment);
    await pwh.click(ids.comment.form.submitBtn);

    await pwh.waitForText(strs.createdComment);

    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "unchecked");
    await pwh.waitForAttrValue(ids.comment.vote.down, "data-state", "unchecked");

    await pwh.click(ids.comment.vote.up);
    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "checked");
    await pwh.waitForAttrValue(ids.comment.vote.down, "data-state", "unchecked");

    await pwh.click(ids.comment.vote.down);
    await pwh.waitForAttrValue(ids.comment.vote.down, "data-state", "checked");
    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "unchecked");

    await pwh.click(ids.comment.vote.down);
    await pwh.waitForAttrValue(ids.comment.vote.down, "data-state", "unchecked");
    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "unchecked");

    await pwh.click(ids.comment.vote.up);
    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "checked");

    await page.reload();
    await pwh.waitForAttrValue(ids.comment.vote.up, "data-state", "checked");
    await pwh.waitForText(testComment);
  });
});
