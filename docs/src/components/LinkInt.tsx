import { ReactRouterPath } from "@/utils/types";
import { Icon, Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import { NavLink as ReactRouterNavLink, href } from "react-router";

export function LinkInt(props: { path: ReactRouterPath; children: ReactNode; icon?: IconType }) {
  return (
    <Link asChild>
      <ReactRouterNavLink to={href(props.path)}>
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
