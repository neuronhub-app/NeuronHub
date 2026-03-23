import { Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";

export function LinkExt(props: { href: string; children: ReactNode; isDecorated?: boolean }) {
  return (
    <Link
      href={props.href}
      rel="nofollow noopener noreferrer"
      target="_blank"
      display="inline-flex"
      alignItems="center"
      mr="0.5"
    >
      {props.children}{" "}
      {(props.isDecorated ?? true) && (
        <Icon
          boxSize="13px"
          color={{ _dark: "fg.subtle", _light: "fg.muted" }}
          mt="-3px"
          ml="-0.5"
        >
          <FiExternalLink />
        </Icon>
      )}
    </Link>
  );
}
