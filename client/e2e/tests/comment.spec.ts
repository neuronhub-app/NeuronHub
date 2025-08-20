import { test } from "@playwright/test";
import { strs } from "@/components/posts/PostDetail/CommentCreateForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Comments", () => {
  let pwh: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    pwh = new PlayWrightHelper(page);
    await pwh.dbStubsRepopulateAndLogin();
  });

  test("create and voting", async ({ page }) => {
    // test creation
    await pwh.navigate(urls.reviews.list);
    await pwh.waitForNetworkIdle();
    await pwh.click(ids.post.card.link.detail);
    await pwh.wait(ids.comment.form.textarea);
    const commentContent = "Test comment";
    await pwh.get(ids.comment.form.textarea).fill(commentContent);
    await pwh.click(ids.comment.form.submitBtn);

    await pwh.expectText(strs.createdComment);

    // test voting
    await pwh.waitForState(ids.comment.vote.up, "unchecked");
    await pwh.waitForState(ids.comment.vote.down, "unchecked");

    await pwh.click(ids.comment.vote.up);
    await pwh.waitForState(ids.comment.vote.up, "checked");
    await pwh.waitForState(ids.comment.vote.down, "unchecked");

    await pwh.click(ids.comment.vote.down);
    await pwh.waitForState(ids.comment.vote.down, "checked");
    await pwh.waitForState(ids.comment.vote.up, "unchecked");

    await pwh.click(ids.comment.vote.down);
    await pwh.waitForState(ids.comment.vote.down, "unchecked");
    await pwh.waitForState(ids.comment.vote.up, "unchecked");

    await pwh.click(ids.comment.vote.up);
    await pwh.waitForState(ids.comment.vote.up, "checked");

    // test reload
    await page.reload();
    await pwh.waitForNetworkIdle();
    await pwh.waitForState(ids.comment.vote.up, "checked");
    await pwh.expectText(commentContent);
  });
});
