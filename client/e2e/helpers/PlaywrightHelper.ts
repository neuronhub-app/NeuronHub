import type { Locator, Page } from "@playwright/test";
import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { ids, type TestId } from "@/e2e/ids";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { urls } from "@/routes";

export type LocatorMap = Record<TestId, Locator>;

const timeoutDefault: number = 4500;

export class PlaywrightHelper {
  $: LocatorMap;
  private screenshotCounter = 0;

  constructor(
    public page: Page,
    private timeout = timeoutDefault,
  ) {
    this.page.setDefaultTimeout(this.timeout);
    this.$ = this.locator();
  }

  async dbStubsRepopulateAndLogin() {
    await this.dbStubsRepopulate();
    await this.login();
  }

  locator(): LocatorMap {
    const map = {};
    return new Proxy(map, { get: (_, selector: TestId) => this.get(selector) });
  }

  getAll(id: string) {
    return this.page.getByTestId(id);
  }

  // todo refac-name: getFirst()? LLMs don't get it
  get(id: string) {
    return this.getAll(id).first();
  }

  async fill(id: string, content: string) {
    const input = this.get(id);
    await input.waitFor();
    await input.clear();
    await input.fill(content);
  }

  async click(id: string, options = { wait: true }) {
    if (options.wait) {
      await this.get(id).waitFor({ state: "attached" }); // "attached" added by #AI. It isn't bad. Probably. Playwright is a mess
    }
    return this.get(id).click();
  }

  async submit(form: typeof ids.post.form) {
    await this.click(form.btn.submit);
    await this.get(form.state.saved).waitFor();
  }

  async reload(opts = { idleWait: false }) {
    await this.page.reload();
    if (opts.idleWait) {
      await this.waitForNetworkIdle();
    }
  }

  async awaitMutation(operationName: "UserCurrent") {
    return this.page.waitForResponse(response => response.url().includes(operationName));
  }

  async dbStubsRepopulate() {
    return client.mutate({
      mutation: graphql(`mutation db_stubs_repopulate { test_db_stubs_repopulate }`),
    });
  }

  async navigate(
    path:
      | typeof urls.posts.list
      | typeof urls.posts.create
      | typeof urls.tools.list
      | typeof urls.posts.knowledge
      | typeof urls.posts.news
      | typeof urls.tools.create
      | typeof urls.reviews.list
      | typeof urls.reviews.create,
    opts?: { idleWait?: boolean; idleWaitTimeout?: number },
  ) {
    await this.page.goto(path);

    if (opts?.idleWait) {
      await this.waitForNetworkIdle({ idleWaitTimeout: opts.idleWaitTimeout ?? this.timeout });
    }
  }

  async addTag(tagName: string, options = { isReviewTag: false }) {
    const container = options.isReviewTag
      ? this.$[ids.review.form.tags]
      : this.$[ids.post.form.tags];
    const input = container.locator("input").first();
    await input.click();
    await input.pressSequentially(tagName, { delay: 100 });
    await this.page.keyboard.press("Enter");
    await expect(container).toHaveTag(tagName);
  }

  getTagVoteButtons(tagName: string, options = { isReviewTag: false }) {
    const container = options.isReviewTag
      ? this.$[ids.review.form.tags]
      : this.$[ids.post.form.tags];
    const tagWrapper = container.getByTestId(`tag-${tagName}`);
    return {
      up: tagWrapper.getByTestId(ids.post.form.tag.vote.up),
      down: tagWrapper.getByTestId(ids.post.form.tag.vote.down),
    };
  }

  async waitForNetworkIdle(opts = { idleWaitTimeout: timeoutDefault }) {
    return this.page.waitForLoadState("networkidle", { timeout: opts.idleWaitTimeout });
  }

  async screenshot(name: string = "screenshot", { fullPage = false, maxH = 3000 } = {}) {
    this.screenshotCounter += 1;
    return this.page.screenshot({
      path: `e2e/screenshots/${this.screenshotCounter}-${name}.png`,
      caret: "initial",
      fullPage,
      clip: { x: 0, y: 0, height: maxH, width: 1280 },
    });
  }

  private async login() {
    await this.page.goto(`${env.VITE_SERVER_URL}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.page.waitForSelector('text="Site administration"');
  }
}
