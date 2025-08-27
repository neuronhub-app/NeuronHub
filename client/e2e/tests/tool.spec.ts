import { test } from "@playwright/test";
import { PostToolForm } from "@/apps/tools/create/PostToolForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("PostTool", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create Tool", async ({ page }) => {
    await page.goto(urls.tools.create);

    await helper.fill(ids.postTool.form.title, "PostgreSQL");
    await helper.click(ids.postTool.btn.submit);

    await helper.expectText(PostToolForm.strs.toolCreated);
  });
});
