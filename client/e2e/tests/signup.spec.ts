import { SignupMutation } from "@/apps/auth/signup/SignupForm";
import { expect } from "@/e2e/helpers/expect";
import { ids } from "@/e2e/ids";
import { testNoAuth } from "@/e2e/test";
import { urls } from "@/urls";

testNoAuth.describe("Signup", () => {
  testNoAuth.beforeEach(async ({ play }) => {
    await play.reset_db_and_gen();
  });

  testNoAuth("happy path", async ({ page, play }) => {
    const user = {
      username: `e2e_signup_${Date.now()}`,
      password: "e2e-password-1234",
    };

    await page.goto(urls.signup);
    await play.fill(ids.auth.signup.username, user.username);
    await play.fill(ids.auth.signup.password, user.password);

    const mutation = play.waitForResponseGraphql(SignupMutation);
    await play.click(ids.auth.signup.submit);
    await mutation;

    await page.waitForURL(urls.home);
    await expect(play.get(ids.auth.logout.btn)).toBeVisible();

    await play.screenshot("signup-success");

    await play.click(ids.auth.logout.btn);
    await page.waitForLoadState("networkidle");

    await page.goto(urls.login);
    await play.fill(ids.auth.login.username, user.username);
    await play.fill(ids.auth.login.password, user.password);
    await play.click(ids.auth.login.submit);

    await page.waitForURL(urls.home);
    await expect(play.get(ids.auth.logout.btn)).toBeVisible();

    await play.screenshot("login-after-signup");
  });
});
