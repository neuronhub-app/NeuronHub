import { Tag } from "@chakra-ui/react";
import { ReactNode } from "react";

export function TagLg(props: { children: ReactNode }) {
  return (
    <Tag.Root size="lg">
      <Tag.Label>
        {props.children}
      </Tag.Label>
    </Tag.Root>
  );
}
