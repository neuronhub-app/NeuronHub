import { ReactRouterPath } from "@/utils/types";
import { Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import { NavLink as ReactRouterNavLink, href } from "react-router";

export function LinkInt(props: {
  path: ReactRouterPath;
  hash?: string;
  children: ReactNode;
  icon?: IconType;
  textDecoration?: "underline" | "none";
}) {
  const to = props.hash ? `${href(props.path)}#${props.hash}` : href(props.path);
  return (
    <Link asChild textDecorationLine={props.textDecoration ?? "underline"}>
      <ReactRouterNavLink to={to}>
        {props.icon && (
          <Icon>
            <props.icon />
          </Icon>
        )}

        {props.children}
      </ReactRouterNavLink>
    </Link>
  );
}
