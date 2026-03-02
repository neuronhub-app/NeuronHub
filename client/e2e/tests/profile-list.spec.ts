import { test } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import {
  type LocatorMapToGetFirstById,
  PlaywrightHelper,
  TestCreateFailedTaskMutate,
} from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { client } from "@/graphql/client";
import { urls } from "@/urls";

// #AI
test.describe("ProfileList", () => {
  test.describe.configure({ mode: "serial" });

  let play: PlaywrightHelper;
  let $: LocatorMapToGetFirstById;
  let isPopulated = false;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    $ = play.$;
    if (!isPopulated) {
      await play.dbStubsRepopulateAndLogin({
        is_import_HN_post: false,
        is_create_single_review: false,
        is_create_profiles: true,
      });
      isPopulated = true;
    } else {
      await play.login();
    }
  });

  test("Sorting switches between GraphQL Django result & Algolia index", async ({ page }) => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    const profileList = page.getByTestId(ids.profile.list);
    await profileList.waitFor();
    const cardsOnDefault = await profileList.getByTestId(ids.profile.card.container).count();
    expect(cardsOnDefault).toBeGreaterThanOrEqual(1);

    // Switch to Django/Your Score
    await page.getByTestId(ids.profile.listControls.sortYourScore).click();
    await play.waitForNetworkIdle();
    await profileList.waitFor();
    const cardsOnUserScore = await profileList.getByTestId(ids.profile.card.container).count();
    expect(cardsOnUserScore).toBeGreaterThanOrEqual(1);

    // Switch Algolia
    await page.getByTestId(ids.profile.listControls.sortDefault).click();
    await play.waitForNetworkIdle();
    await profileList.waitFor();
    const cardsBackToDefault = await profileList.getByTestId(ids.profile.card.container).count();
    expect(cardsBackToDefault).toBeGreaterThanOrEqual(1);
  });

  test("trigger LLM shows progress bar, cancel hides it", async () => {
    await play.navigate(urls.profiles.list, { idleWait: true });

    // Open popover and set limit
    await play.click(ids.profile.llm.triggerButton);
    await play.fill(ids.profile.llm.limitInput, "3");

    await play.click(ids.profile.llm.submitButton);

    // Progress bar appears with correct info
    const progressBar = $[ids.profile.llm.progressBar];
    await progressBar.waitFor();

    const progressText = await progressBar.textContent();
    expect(progressText).toContain("haiku");
    expect(progressText).toContain("/ 3");

    // Cancel hides the progress
    await play.click(ids.profile.llm.cancelButton);
    await progressBar.waitFor({ state: "hidden" });
  });

  test("failed task shows error message", async () => {
    // Create a failed task via test mutation
    await client.mutate({ mutation: TestCreateFailedTaskMutate });

    await play.navigate(urls.profiles.list, { idleWait: true });

    // Error state shows in progress bar area
    const progressBar = $[ids.profile.llm.progressBar];
    await progressBar.waitFor();

    const text = await progressBar.textContent();
    expect(text).toContain("AI Matching failed");
    expect(text).toContain("db_worker is not running");
  });
});
