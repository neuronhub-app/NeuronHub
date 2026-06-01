import { ReactNode } from "react";

import { LinkExt } from "@/components/LinkExt";

// Without children the `to` shorthand renders as the link label.
export function Src(props: { to: keyof typeof links; children?: ReactNode }) {
  return <LinkExt href={links[props.to]}>{props.children ?? props.to}</LinkExt>;
}

// Source-path shorthand → GitHub blob URL. Imported by `lint-mdx.ts` to verify paths.
export const paths = {
  github: "https://github.com/neuronhub-app/NeuronHub/blob/master",
  apps: "/server/neuronhub/apps",
};

export const links = {
  // server
  "posts/index.py": `${paths.github}${paths.apps}/posts/index.py`,
  "jobs/index.py": `${paths.github}${paths.apps}/jobs/index.py`,
  "profiles/index.py": `${paths.github}${paths.apps}/profiles/index.py`,
  "posts/graphql/types.py": `${paths.github}${paths.apps}/posts/graphql/types.py`,
  "posts/services/filter_posts_by_user.py": `${paths.github}${paths.apps}/posts/services/filter_posts_by_user.py`,
  "posts/models/posts.py": `${paths.github}${paths.apps}/posts/models/posts.py`,
  "users/graphql/resolvers.py": `${paths.github}${paths.apps}/users/graphql/resolvers.py`,
  "tests/test_cases.py": `${paths.github}${paths.apps}/tests/test_cases.py`,
  "tests/test_gen.py": `${paths.github}${paths.apps}/tests/test_gen.py`,
  "jobs/models.py": `${paths.github}${paths.apps}/jobs/models.py`,
  "jobs/services/send_job_alerts.py": `${paths.github}${paths.apps}/jobs/services/send_job_alerts.py`,
  "jobs/services/send_job_alerts__test.py": `${paths.github}${paths.apps}/jobs/services/send_job_alerts__test.py`,
  "jobs/services/publish_job_versions.py": `${paths.github}${paths.apps}/jobs/services/publish_job_versions.py`,
  "jobs/services/get_jobs_public_from_ram.py": `${paths.github}${paths.apps}/jobs/services/get_jobs_public_from_ram.py`,
  "mise.toml": `${paths.github}/mise.toml`,
  "schema.graphql": `${paths.github}/schema.graphql`,
  "server/persisted-queries.json": `${paths.github}/server/persisted-queries.json`,
  "server/persisted-queries-prev-release.json": `${paths.github}/server/persisted-queries-prev-release.json`,

  // client
  "env.ts": `${paths.github}/client/src/env.ts`,
  "client/src/routes.ts": `${paths.github}/client/src/routes.ts`,
  "codegen.ts": `${paths.github}/client/src/codegen.ts`,
  "graphql/client.ts": `${paths.github}/client/src/graphql/client.ts`,
  "mutateAndRefetchMountedQueries.tsx": `${paths.github}/client/src/graphql/mutateAndRefetchMountedQueries.tsx`,
  "useApolloQuery.ts": `${paths.github}/client/src/graphql/useApolloQuery.ts`,
  "useAlgoliaEnrichmentByGraphql.ts": `${paths.github}/client/src/graphql/useAlgoliaEnrichmentByGraphql.ts`,
  "useAlgoliaSearchClient.ts": `${paths.github}/client/src/utils/useAlgoliaSearchClient.ts`,
  "toast.tsx": `${paths.github}/client/src/utils/toast.tsx`,
  "posts/form/schemas.ts": `${paths.github}/client/src/components/posts/form/schemas.ts`,
  "LayoutContainer.tsx": `${paths.github}/client/src/components/LayoutContainer.tsx`,
  "LayoutSidebar.tsx": `${paths.github}/client/src/components/LayoutSidebar.tsx`,
  "useHeadMeta.tsx": `${paths.github}/client/src/components/useHeadMeta.tsx`,
  "root.tsx": `${paths.github}/client/src/root.tsx`,
  "useStateValtio.ts": `${paths.github}/packages/shared/src/utils/useStateValtio.ts`,
  "siteConfigState.ts": `${paths.github}/client/src/sites/pg/siteConfigState.ts`,
  "JobAlertList.tsx": `${paths.github}/client/src/apps/jobs/subscriptions/JobAlertList.tsx`,
  "PgJobAlertList.tsx": `${paths.github}/client/src/sites/pg/pages/jobs/subscriptions/PgJobAlertList.tsx`,
  "JobsSubscribeModal.tsx": `${paths.github}/client/src/apps/jobs/list/JobsSubscribeModal.tsx`,
  "PgFiltersTopbar.tsx": `${paths.github}/client/src/sites/pg/components/PgFiltersTopbar.tsx`,
  "prefetch/JobsLandingPage.ts": `${paths.github}/client/src/prefetch/JobsLandingPage.ts`,
  "runPrefetch.ts": `${paths.github}/client/src/prefetch/runPrefetch.ts`,
  "landingPageToAlgoliaState.ts": `${paths.github}/client/src/sites/pg/pages/jobs-landing-page/landingPageToAlgoliaState.ts`,
  "job-alert.spec.ts": `${paths.github}/client/e2e/tests/job-alert.spec.ts`,
  "jobs-landing-page.spec.ts": `${paths.github}/client/e2e/tests/jobs-landing-page.spec.ts`,

  // docs-site
  "docs/react-router.config.ts": `${paths.github}/docs/react-router.config.ts`,
  "docs/vite.config.ts": `${paths.github}/docs/vite.config.ts`,
  "docs/src/routes.ts": `${paths.github}/docs/src/routes.ts`,
  "DocsLayout.tsx": `${paths.github}/docs/src/components/DocsLayout.tsx`,
  "Toc.tsx": `${paths.github}/docs/src/components/Toc.tsx`,
  "frontmatter.ts": `${paths.github}/docs/src/components/frontmatter.ts`,
  "buildNavTree.ts": `${paths.github}/docs/src/components/buildNavTree.ts`,
  "dir-redirect.tsx": `${paths.github}/docs/src/pages/dir-redirect.tsx`,

  // landing pages spec log
  "LLM-spec-logs/184-feat-jobs-landing-pages.md": `${paths.github}/docs/src/pages/development/reference/LLM-spec-logs/184-feat-jobs-landing-pages.md`,
} as const;
