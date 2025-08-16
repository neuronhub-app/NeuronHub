import { expect, type Page } from "@playwright/test";
import { config } from "@/e2e/config";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { urls } from "@/routes";

export class PlayWrightHelper {
  timeout = 2000;

  constructor(private page: Page) {
    this.page.setDefaultTimeout(this.timeout);
  }

  async dbStubsRepopulateAndLogin() {
    await this.dbStubsRepopulate();
    await this.login();
  }

  async login() {
    await this.page.goto(`${env.VITE_SERVER_URL}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.waitForText("Site administration");
  }

  async navigate(path: typeof urls.reviews.list) {
    await this.page.goto(path);
  }

  get(id: string) {
    return this.page.getByTestId(id).first();
  }

  async getInt(id: string) {
    return Number.parseInt((await this.get(id).textContent()) ?? "", 10);
  }

  getAll(id: string) {
    return this.page.getByTestId(id);
  }

  async click(id: string) {
    return this.get(id).click();
  }

  async wait(id: string) {
    return this.get(id).waitFor();
  }

  async waitForText(text: string) {
    await this.page.waitForSelector(`text="${text}"`);
  }

  async waitForState(testId: string, state: "checked" | "unchecked") {
    await this.waitForAttrValue(testId, "data-state", state);
  }
  async waitForAttrValue(testId: string, attr: string, expectedValue: string) {
    await expect(this.get(testId)).toHaveAttribute(attr, expectedValue);
  }

  async dbStubsRepopulate() {
    return client.mutate({
      mutation: graphql(`mutation db_stubs_repopulate { test_db_stubs_repopulate }`),
    });
  }

  waitForNetworkIdle() {
    return this.page.waitForLoadState("networkidle");
  }
}
