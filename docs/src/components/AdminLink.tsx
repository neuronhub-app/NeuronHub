import { LinkExt } from "@/components/LinkExt";
import { env } from "@/env";
import { ReactNode } from "react";

export function AdminLink(props: { id: keyof typeof links; children?: ReactNode }) {
  return (
    <LinkExt href={`${env.VITE_SERVER_URL}${links[props.id]}`}>
      {props.children ?? props.id}
    </LinkExt>
  );
}

const links = {
  Home: "/admin/",
  SiteConfig: "/admin/sites/siteconfig/",
  JobAlert: "/admin/jobs/jobalert/",
} as const;
