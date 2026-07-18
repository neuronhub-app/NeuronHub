import type { ReactNode } from "react";

import { Tooltip } from "@/components/ui/tooltip";

const openDelayMs = 1_500;

export function ExplainerTooltip(props: {
  content?: string;
  placement: "top" | "right";
  children: ReactNode;
}) {
  return (
    <Tooltip
      content={props.content}
      disabled={!props.content}
      positioning={{ placement: props.placement }}
      openDelay={openDelayMs}
    >
      {props.children}
    </Tooltip>
  );
}
