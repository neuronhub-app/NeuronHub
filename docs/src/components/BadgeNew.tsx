import { Badge, SystemStyleObject } from "@chakra-ui/react";
import { theme } from "@neuronhub/shared/theme/colors";

export function BadgeNew(props: { isHeading?: boolean }) {
  const headingStyle: SystemStyleObject = props.isHeading
    ? { pos: "absolute", mt: "4px", ml: "gap.sm" }
    : {};
  return (
    <Badge size="sm" colorPalette={theme.colorPrimary} {...headingStyle}>
      New
    </Badge>
  );
}
