import type { Page } from "@playwright/test";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { test } from "@/e2e/test";
import { urls } from "@/urls";

test.describe("Tool", () => {
  test.beforeEach(async ({ play }) => {
    await play.reset_db();
  });

  test("Create with an .image", async ({ page, play, $ }) => {
    await play.navigate(urls.tools.create);

    const tool = { title: `Docker ${new Date()}` };
    await play.fill(ids.post.form.title, tool.title);

    await $[ids.post.form.image].setInputFiles(await genImagePng(page));

    await play.submit(ids.post.form);
    await expect(page).toHaveText(tool.title);
    await play.navigate(urls.tools.list);

    const image = play.get(ids.post.card.image);
    const isLoaded = await image.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });
    expect(isLoaded).toBeTruthy();
  });
});

// #AI
async function genImagePng(page: Page) {
  const imageCanvas = await page.evaluateHandle(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "red";
    context.fillRect(0, 0, 100, 100);
    return canvas;
  });
  const imageBlob = await page.evaluate(canvas => {
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
