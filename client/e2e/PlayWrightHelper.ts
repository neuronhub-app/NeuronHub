import { expect, type Page } from "@playwright/test";
import { config } from "@/e2e/config";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { urls } from "@/routes";

export class PlayWrightHelper {
  constructor(
    private page: Page,
    private timeout = 2400,
    private timeoutDeviation = 1000,
  ) {
    this.page.setDefaultTimeout(this.timeout);
  }

  async dbStubsRepopulateAndLogin() {
    await this.dbStubsRepopulate();
    await this.login();
  }

  async navigate(path: typeof urls.reviews.list | typeof urls.posts.list) {
    return this.page.goto(path);
  }

  getAll(id: string) {
    return this.page.getByTestId(id);
  }

  get(id: string) {
    return this.getAll(id).first();
  }

  async fill(id: string, content: string) {
    const input = this.get(id);
    await input.waitFor();
    await input.fill(content);
  }

  async click(id: string, options: { wait: boolean } = { wait: true }) {
    if (options.wait) {
      await this.get(id).waitFor();
    }
    return this.get(id).click();
  }

  async wait(id: string) {
    return this.get(id).waitFor({ timeout: this.timeout + this.timeoutDeviation });
  }

  async expectText(text: string) {
    await this.page.waitForSelector(`text="${text}"`);
  }

  async waitForState(testId: string, state: "checked" | "unchecked") {
    await expect(this.get(testId)).toHaveAttribute("data-state", state);
  }

  waitForNetworkIdle() {
    return this.page.waitForLoadState("networkidle");
  }

  async dbStubsRepopulate() {
    return client.mutate({
      mutation: graphql(`mutation db_stubs_repopulate { test_db_stubs_repopulate }`),
    });
  }

  private async login() {
    await this.page.goto(`${env.VITE_SERVER_URL}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.expectText("Site administration");
  }
}
