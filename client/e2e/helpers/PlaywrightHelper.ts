import type { Locator, Page } from "@playwright/test";
import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { ids, type TestId } from "@/e2e/ids";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { urls } from "@/routes";

export type LocatorMap = Record<TestId, Locator>;

export class PlaywrightHelper {
  $: LocatorMap;

  constructor(
    public page: Page,
    private timeout = 4500,
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

  async click(id: string, options: { wait: boolean } = { wait: true }) {
    if (options.wait) {
      await this.get(id).waitFor({ state: "attached" });
    }
    return this.get(id).click();
  }

  async reload(opts = { idleWait: false }) {
    await this.page.reload();
    if (opts.idleWait) {
      return this.page.waitForLoadState("networkidle");
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
      | typeof urls.tools.create
      | typeof urls.reviews.list
      | typeof urls.reviews.create,
    opts = { idleWait: false },
  ) {
    await this.page.goto(path);

    if (opts.idleWait) {
      await this.page.waitForLoadState("networkidle");
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

  async screenshot(name: string = "screenshot") {
    return this.page.screenshot({ path: `${name}.png`, fullPage: true });
  }

  private async login() {
    await this.page.goto(`${env.VITE_SERVER_URL}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.page.waitForSelector('text="Site administration"');
  }
}
