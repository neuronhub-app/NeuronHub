import { Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FiExternalLink } from "react-icons/fi";

export function LinkExt(props: { href: string; children: ReactNode; isDecorated?: boolean }) {
  return (
    <Link
      href={props.href}
      target="_blank"
      rel="nofollow"
      display="inline-flex"
      alignItems="center"
    >
      {props.children}{" "}
      {(props.isDecorated ?? true) && (
        <Icon boxSize="12px" color="fg.muted">
          <FiExternalLink />
        </Icon>
      )}
    </Link>
  );
}
