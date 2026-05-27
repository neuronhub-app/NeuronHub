import { UpdateCollapsedCommentsMutation } from "@/components/posts/PostDetail/useCommentCollapse";
import { UpdateReadCommentsMutation } from "@/components/posts/PostDetail/useCommentRead";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

const tool = "PyCharm";
const review = "Fine review";
const commentContent = "Top-level comment for read+collapse";

test.describe("Comment read + collapse", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      { posts_tool: { title: tool } },
      { posts_review: { parent: tool, title: review } },
      { posts_comment: { parent_root: review, content_polite: commentContent } },
    ]);
  });

  test("mark a comment as read via the thread line", async ({ page, play }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    const avatar = play.get(ids.comment.thread.avatar);
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute("data-state", "unread");

    const mutation = play.waitForResponseGraphql(UpdateReadCommentsMutation);
    await play.click(ids.comment.thread.line);
    await mutation;

    await expect(avatar).toHaveAttribute("data-state", "read");

    await play.screenshot("comment-marked-read");

    await play.reload({ idleWait: true });
    await expect(play.get(ids.comment.thread.avatar)).toHaveAttribute("data-state", "read");
  });

  test("collapse a comment via the [-] toolbar button", async ({ page, play }) => {
    await play.navigate(urls.reviews.list, { idleWait: true });
    await play.click(ids.post.card.link.detail);
    await play.waitForNetworkIdle();

    await expect(page.getByText(commentContent)).toBeVisible();

    const mutation = play.waitForResponseGraphql(UpdateCollapsedCommentsMutation);
    await play.click(ids.comment.btn.collapse);
    await mutation;

    await expect(page.getByText(commentContent)).not.toBeVisible();

    await play.screenshot("comment-collapsed");
  });
});
