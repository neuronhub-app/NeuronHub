import { type ConsoleMessage, expect, test } from "@playwright/test";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { env } from "@/env";
import { urls } from "@/routes";

test.describe("Apollo", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  /**
   * Apollo can't handle gql.tada `disableMasking: true`, hence [[client.ts]] needs `possibleTypes` definition,
   * to make it understand that fragments can spread across [[PostTypeI]].
   *
   * Otherwise Apollo queries the correct HTTP data, but excludes it from the cache, fucking up the app (see #40).
   */
  test(`${urls.reviews.list} loads with PostFragment fields & no infinite re-renders`, async ({
    page,
  }) => {
    console.log(env.VITE_SERVER_URL_API);

    const consoleLogs: ConsoleMessage[] = [];
    page.on("console", msg => consoleLogs.push(msg));

    await helper.navigate(urls.reviews.list);
    await helper.waitForNetworkIdle();
    expect(consoleLogs.filter(msg => msg.type() === "error").length).toBe(0);

    const reviewsCount = await helper.getAll(ids.post.card.container).count();
    expect(reviewsCount).toBeGreaterThan(0);
  });

  /**
   * Nav to /detail & back, in order to trigger react-router re-mount.
   * Eg urql is unable to detect its `useQuery` hooks re-mount, hence unable reload them on a mutation (#39).
   */
  test("refetchQueries() works after react-router 'Back' navigation remount", async ({
    page,
  }) => {
    await helper.navigate(urls.reviews.list);
    const votes = await helper.getInt(ids.post.vote.count);

    await helper.click(ids.post.card.link);
    await helper.get(ids.comment.form.textarea).waitFor();
    await page.goBack();

    // confirm refetchQueries() reloads votes count
    await helper.click(ids.post.vote.up);
    await helper.waitForState(ids.post.vote.up, "checked");
    expect(await helper.getInt(ids.post.vote.count)).toBe(votes + 1);
  });
});
