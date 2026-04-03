import { Badge } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

export function ChangelogTag(props: { tag: "New" | "Improvements" | "UI" | "Fixes" }) {
  return (
    <Badge
      size="md"
      colorPalette={getColor(props.tag)}
      w="fit-content"
      _notFirst={{
        mt: "gap.md",
      }}
      mr="gap.sm"
    >
      {props.tag}
    </Badge>
  );
}

function getColor(tag: ComponentProps<typeof ChangelogTag>["tag"]) {
  switch (tag) {
    case "New":
      return "green";
    case "Improvements":
      return "violet";
    case "Fixes":
      return "slate";
    case "UI":
      return "slate";
  }
}
