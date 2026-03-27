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
} as const;
