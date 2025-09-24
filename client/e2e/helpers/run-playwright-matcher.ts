import type { ExpectMatcherState, Locator } from "@playwright/test";
import type { MatcherReturnType } from "playwright/types/test";

/**
 * I moved this out of [[expect.ts]] for LLM context rot sake.
 *
 * Mostly a copy-paste of [the docs example](https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend)
 */
export async function runPlaywrightMatcher(params: {
  locator: Locator;
  name: string;
  expected: string | boolean;
  context: ExpectMatcherState;
  assertion: () => Promise<void>;
}) {
  let isPassed: boolean;
  let matcherResult: MatcherReturnType | null = null;

  try {
    await params.assertion();
    isPassed = !params.context.isNot;
    // biome-ignore lint/suspicious/noExplicitAny: no type exist
  } catch (e: any) {
    matcherResult = e.matcherResult;
    isPassed = params.context.isNot;
  }

  const message = isPassed
    ? () =>
        params.context.utils.matcherHint(params.name, undefined, undefined, {
          isNot: params.context.isNot,
        }) +
        "\n\n" +
        `Locator: ${params.locator}\n` +
        `Expected: not ${params.context.utils.printExpected(params.expected)}\n` +
        (matcherResult
          ? `Received: ${params.context.utils.printReceived(matcherResult.actual)}`
          : "")
    : () =>
        params.context.utils.matcherHint(params.name, undefined, undefined, {
          isNot: params.context.isNot,
        }) +
        "\n\n" +
        `Locator: ${params.locator}\n` +
        `Expected: ${params.context.utils.printExpected(params.expected)}\n` +
        (matcherResult
          ? `Received: ${params.context.utils.printReceived(matcherResult.actual)}`
          : "");

  return {
    message,
    pass: isPassed,
    name: params.name,
    expected: params.expected,
    actual: matcherResult?.actual,
  };
}
