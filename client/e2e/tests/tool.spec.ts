import { expect, test } from "@playwright/test";
import { PostToolForm } from "@/apps/tools/create/PostToolForm";
import { ids } from "@/e2e/ids";
import { PlayWrightHelper } from "@/e2e/PlayWrightHelper";
import { urls } from "@/routes";

test.describe("Tool", () => {
  let helper: PlayWrightHelper;

  test.beforeEach(async ({ page }) => {
    helper = new PlayWrightHelper(page);
    await helper.dbStubsRepopulateAndLogin();
  });

  test("Create with Image", async ({ page }) => {
    await page.goto(urls.tools.create);

    const tool = { title: "Docker" };
    await helper.fill(ids.post.form.title, tool.title);

    const input = helper.get(ids.post.form.image);
    await input.setInputFiles(await generateImageSquareRed());

    await helper.click(ids.post.form.btn.submit);
    await helper.expectText(PostToolForm.strs.toolCreated);
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
      buffer: Buffer.from(imageBlob.split(",")[1], "base64"), // ahem, whatever...
    };
  }
});
