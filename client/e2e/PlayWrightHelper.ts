import { expect, type Page } from "@playwright/test";
import { GraphQLClient } from "graphql-request";
import { config } from "@/e2e/config";
import type { urls } from "@/routes";

export class PlayWrightHelper {
  constructor(private page: Page) {
    this.page.setDefaultTimeout(2000);
  }

  async dbResetAndLogin() {
    await this.dbStubsRepopulate();
    await this.login();
  }

  async login() {
    await this.page.goto(`${config.server.url}/admin/login/`);
    await this.page.fill('input[name="username"]', config.user.username);
    await this.page.fill('input[name="password"]', config.user.password);
    await this.page.click('input[type="submit"]');
    await this.waitForText("Site administration");
  }

  async navigate(path: typeof urls.reviews.$) {
    await this.page.goto(path);
  }

  get(id: string) {
    return this.page.getByTestId(id).first();
  }

  getAll(id: string) {
    return this.page.getByTestId(id);
  }

  async click(id: string) {
    return this.get(id).click();
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
    const client = new GraphQLClient(config.server.apiUrl, {
      credentials: "include",
      mode: "cors",
    });

    return client.request(`mutation db_stubs_repopulate { test_db_stubs_repopulate }`, {});
  }
}
