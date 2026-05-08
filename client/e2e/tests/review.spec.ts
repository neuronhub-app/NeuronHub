import { expect } from "@/e2e/helpers/expect";
import type { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

const reviewTitle = "Fine review";

test.describe("Review", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen([
      {
        posts_tool: {
          title: "PyCharm",
          tags: [{ name: "Software / IDE" }],
        },
      },
      {
        posts_review: {
          parent: "PyCharm",
          title: reviewTitle,
          tags: [
            { name: "Dev / Python", is_vote_pos: true },
            { name: "Dev / Django", is_vote_pos: true },
          ],
        },
      },
    ]);
  });

  test("Create", async ({ page, play, $ }) => {
    await play.navigate(urls.reviews.create, { idleWait: true });

    const tool = $[ids.post.form.title].locator("input").first();
    await tool.click();
    await tool.pressSequentially("Django", { delay: 100 });
    await page.keyboard.press("Enter");

    await play.fill(ids.review.form.title, "Django Review");
    await play.fill(ids.post.form.content_polite, "Easy to build with");
    await play.submit(ids.post.form);

    // Test 2: create with an existing .parent
    await play.navigate(urls.reviews.create, { idleWait: true });

    await tool.click();
    await tool.pressSequentially("PyCharm", { delay: 100 });
    await page.keyboard.press("Enter");

    await play.fill(ids.review.form.title, "Test Review");
    await play.submit(ids.post.form);
  });

  test("Edit Review.tags & Tool.tags", async ({ play, $ }) => {
    play.setDefaultTimeout(12_000); // 7.5s makes it flaky

    await play.navigate(urls.reviews.list);
    await openEditFormPyCharm(play);

    const tags = {
      parent: { existing: "IDE" },
      review: { existing: "Python", new: "FastAPI" },
    };

    const reviewTags = $[ids.review.form.tags];
    await expect(reviewTags).toHaveTag(tags.review.existing);
    const toolTags = $[ids.post.form.tags];
    await expect(toolTags).toHaveTag(tags.parent.existing);

    // Add
    await play.addTag(tags.review.new, { isReviewTag: true });
    await play.submit(ids.post.form, { waitIdle: true });
    await openEditFormPyCharm(play);
    await expect(reviewTags).toHaveTag(tags.review.new);

    // todo refac: use ids - ie make "remove" btn a child of ids.review.form.tags
    await reviewTags.locator(`[aria-label="Remove ${tags.review.new}"]`).click();
    await play.submit(ids.post.form, { waitIdle: true });
    await openEditFormPyCharm(play);
    await expect(reviewTags).not.toHaveTag(tags.review.new);
    await expect(toolTags).toHaveTag(tags.review.new);
  });

  test("Tag (existing) voting & add a Tag", async ({ play, $ }) => {
    await play.navigate(urls.reviews.list);
    await openEditFormPyCharm(play);

    const tags = { existing: "Django", new: "New tag" };
    const vote = play.getTagVoteButtons(tags.existing, { isReviewTag: true });

    // initial check
    await expect(vote.up).checked();
    await expect(vote.down).not.checked();

    // downvote
    await vote.down.click();
    await play.submit(ids.post.form, { waitIdle: true });
    await openEditFormPyCharm(play);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();

    // add new
    await play.addTag(tags.new, { isReviewTag: true });
    await play.submit(ids.post.form, { waitIdle: true });
    await openEditFormPyCharm(play);
    await expect($[ids.review.form.tags]).toHaveTag(tags.existing);
    await expect($[ids.review.form.tags]).toHaveTag(tags.new);
    await expect(vote.up).not.checked();
    await expect(vote.down).checked();
  });
});

async function openEditFormPyCharm(play: PlaywrightHelper) {
  const card = play.getAll(ids.post.card.container).filter({ hasText: reviewTitle }).first();
  await card.getByTestId(ids.post.card.link.edit).click();
}
