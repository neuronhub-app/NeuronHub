import { test as testBase, expect } from "@playwright/test";

import { type LocatorMapToGetFirstById, PlaywrightHelper } from "@/e2e/helpers/PlaywrightHelper";

export { expect };

export const authSetupStatePath = "e2e/auth.state.json";

type Fixtures = { play: PlaywrightHelper; $: LocatorMapToGetFirstById };

export const test = testBase.extend<Fixtures>({
  storageState: authSetupStatePath,
  play: async ({ page }, use) => use(new PlaywrightHelper(page)),
  $: async ({ play }, use) => use(play.$),
});

export const testNoAuth = testBase.extend<Fixtures>({
  storageState: { cookies: [], origins: [] },
  play: async ({ page }, use) => use(new PlaywrightHelper(page)),
  $: async ({ play }, use) => use(play.$),
});
