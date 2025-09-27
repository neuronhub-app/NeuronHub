import { test } from "@playwright/test";
import { PostToolForm } from "@/apps/tools/create/PostToolForm";
import { expect } from "@/e2e/helpers/expect";
import { PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";
import { ids } from "@/e2e/ids";
import { urls } from "@/routes";

test.describe("Tool", () => {
  let play: PlaywrightHelper;

  test.beforeEach(async ({ page }) => {
    play = new PlaywrightHelper(page);
    await play.dbStubsRepopulateAndLogin();
  });

  test("Create with Image", async ({ page }) => {
    await page.goto(urls.tools.create);

    const tool = { title: "Docker" };
    await play.fill(ids.post.form.title, tool.title);

    const input = play.get(ids.post.form.image);
    await input.setInputFiles(await genImagePng());

    await play.click(ids.post.form.btn.submit);
    await expect(page).toHaveText(PostToolForm.strs.toolCreated);
    await play.navigate(urls.tools.list);

    const image = play.get(ids.post.card.image);
    const isLoaded = await image.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });
    expect(isLoaded).toBeTruthy();
  });

  // #AI
  async function genImagePng() {
    const imageCanvas = await play.page.evaluateHandle(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "red";
      context.fillRect(0, 0, 100, 100);
      return canvas;
    });
    const imageBlob = await play.page.evaluate(canvas => {
      return new Promise<string>(resolve => {
        canvas.toBlob(blob => {
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
