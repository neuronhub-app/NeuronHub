import type { OperationVariables } from "@apollo/client";
import type { Locator, Page } from "@playwright/test";
import type { TadaDocumentNode } from "gql.tada";
import { print } from "graphql";
import { config } from "@/e2e/config";
import { expect } from "@/e2e/helpers/expect";
import { ids, type TestId } from "@/e2e/ids";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { urls } from "@/urls";

export type LocatorMap = Record<TestId, Locator>;

const timeoutDefault: number = 4500;

export class PlaywrightHelper {
  $: LocatorMap;
  private screenshotCounter = 0;

  constructor(
    public page: Page,
    public timeout = timeoutDefault,
  ) {
    this.page.setDefaultTimeout(this.timeout);
    this.$ = this.locator();
  }

  async dbStubsRepopulateAndLogin(options?: {
    is_import_HN_post?: boolean;
    is_create_single_review?: boolean;
  }) {
    await this.dbStubsRepopulate(options);
    await this.login();
  }

  // #AI, but reviewed. Seems ok. Mb use the fixed on 2025-10-28 [[useApolloQuery.ts]] types.
  async graphqlQuery<TData, TVariables extends OperationVariables>(
    query: TadaDocumentNode<TData, TVariables>,
    variables: TVariables,
  ): Promise<{ data: TData }> {
    // use Playwright's request context, which shares cookies with the browser,
    // while client.query runs in isolated by PW Vite env
    const response = await this.page.request.post(`${env.VITE_SERVER_URL}/api/graphql`, {
      headers: { "Content-Type": "application/json" },
      data: { query: print(query), variables },
    });

    return response.json();
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
      await this.get(id).waitFor({ state: "attached" }); // "attached" added by #AI. It isn't bad, prob. Playwright is a mess
    }
    return this.get(id).click();
  }

  async submit(form: typeof ids.post.form, options = { waitIdle: false }) {
    await this.click(form.btn.submit);
    await this.get(ids.form.notification.success).waitFor();
    if (options.waitIdle) {
      await this.waitForNetworkIdle();
    }
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

  async dbStubsRepopulate(options?: {
    is_import_HN_post?: boolean;
    is_create_single_review?: boolean;
  }) {
    return client.mutate({ mutation: DbStubsRepopulateMutate, variables: options });
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
    const cookies = await this.page.context().cookies();
    const isHasDjangoSession = cookies.some(cookie => cookie.name === "sessionid");
    if (isHasDjangoSession) {
      return;
    }

    await this.page.goto(`${env.VITE_SERVER_URL}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.page.waitForSelector('text="Site administration"');
  }
}

const DbStubsRepopulateMutate = graphql.persisted(
  "db_stubs_repopulate",
  graphql(`
    mutation db_stubs_repopulate($is_import_HN_post: Boolean, $is_create_single_review: Boolean) {
      test_db_stubs_repopulate(is_import_HN_post: $is_import_HN_post, is_create_single_review: $is_create_single_review)
    }
  `),
);
