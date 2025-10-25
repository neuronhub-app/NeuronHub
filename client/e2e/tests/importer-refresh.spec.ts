import { test } from "@playwright/test";

import { expect } from "@/e2e/helpers/expect";
import { type LocatorMap, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";

test.describe("Importer Refresh", () => {
  let play: PlaywrightHelper;
  let $: LocatorMap;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
    $ = play.locator();
  });

  test("Refresh imported HN post", async ({ page }) => {
    const postQuery = await play.graphqlQuery(
      graphql(`
        query PostsImported {
          posts {
            id
            title
            posts_source {
              id_external
            }
          }
        }
      `),
      {},
    );

    const importedPost = postQuery.data.posts.find(p => p.posts_source.length > 0);
    if (!importedPost) {
      throw new Error("No imported post found");
    }

    const postId = importedPost.id;
    console.log(`Testing with imported post ID: ${postId}`);

    await page.goto(`/posts/${postId}`);

    await expect($[ids.post.btn.importRefresh]).toBeVisible();

    await play.click(ids.post.btn.importRefresh);

    console.log("Clicked refresh button, mutation should be running...");
  });
});
