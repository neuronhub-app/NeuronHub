import { LinkExt } from "@/components/LinkExt";
import { ReactNode } from "react";

export function SourceLink(props: { id: keyof typeof links; children?: ReactNode }) {
  const path = links[props.id];
  return <LinkExt href={path}>{props.children ?? props.id}</LinkExt>;
}

const paths = {
  github: "https://github.com/neuronhub-app/NeuronHub/blob/master",
  apps: "/server/neuronhub/apps",
};

const links = {
  jobs: `${paths.github}${paths.apps}/jobs/models.py`,
  jobs_public_graphql: `${paths.github}${paths.apps}/jobs/services/get_jobs_public_from_ram.py`,
  llm_spec_landing_pages: `${paths.github}/docs/src/pages/development/reference/LLM-spec-logs/184-feat-jobs-landing-pages.md`,
} as const;
