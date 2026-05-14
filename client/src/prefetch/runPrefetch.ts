/**
 * #AI-slop
 * For mise client:prefetch-from-server. Client lookup in [[getLandingPageBySlug.ts]].
 */
import { print } from "graphql";
import { env } from "@/env";
import { type JobsLandingPagesData, jobsLandingPagesDoc } from "@/prefetch/JobsLandingPage";

await runPrefetch();

async function runPrefetch() {
  // todo ! refac: it uses tsconfig above -> use alias, not URL trash.
  // #AI: from module URL so cwd doesn't matter.
  const outPath = new URL("../../graphql/prefetch/JobsLandingPages.json", import.meta.url);
  const res = await fetch(env.VITE_SERVER_URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: print(jobsLandingPagesDoc) }),
  });
  const resJson = (await res.json()) as { data?: JobsLandingPagesData; errors?: unknown };

  if (resJson.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(resJson.errors)}`);
  }
  const pages = resJson.data?.jobs_landing_pages ?? [];
  if (pages.length === 0) {
    console.log("jobs_landing_pages empty — no active pages");
  }

  const fs = await import("node:fs/promises");
  await fs.writeFile(outPath, `${JSON.stringify(resJson.data, null, 2)}\n`);
  console.log(`Wrote ${pages.length} landing pages to ${outPath.pathname}`);
}
