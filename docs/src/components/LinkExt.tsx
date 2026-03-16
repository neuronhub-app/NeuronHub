import { Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { LuExternalLink } from "react-icons/lu";

export function LinkExt(props: { href: string; children: ReactNode }) {
  return (
    <Link href={props.href} target="_blank" rel="nofollow">
      {props.children}{" "}
      <Icon boxSize="3.5" color="fg.muted">
        <LuExternalLink />
      </Icon>
    </Link>
  );
}
