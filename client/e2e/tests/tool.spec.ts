import { test } from "@playwright/test";
import { PostToolForm } from "@/apps/tools/create/PostToolForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Tool", () => {
  let helper: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlaywrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create with Image", async ({ page }) => {
    await page.goto(urls.tools.create);

    const tool = { title: "Docker" };
    await helper.fill(ids.post.form.title, tool.title);

    const input = helper.get(ids.post.form.image);
    await input.setInputFiles(await generateImageSquareRed());

    await helper.click(ids.post.form.btn.submit);
    await expect(page).toHaveText(PostToolForm.strs.toolCreated);
    await helper.navigate(urls.tools.list);

    const image = helper.get(ids.post.card.image);
    const isLoaded = await image.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });
    expect(isLoaded).toBeTruthy();
  });

  // #AI
  async function generateImageSquareRed() {
    const imageCanvas = await helper.page.evaluateHandle(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "red";
      context.fillRect(0, 0, 100, 100);
      return canvas;
    });
    const imageBlob = await helper.page.evaluate(canvas => {
      return new Promise<string>(resolve => {
        (canvas as HTMLCanvasElement).toBlob(blob => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob!);
        });
      });
    }, imageCanvas);
    return {
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(imageBlob.split(",")[1], "base64"), // it works - so whatever...
    };
  }
});
