import {
  Bleed,
  Box,
  Button,
  type ButtonProps,
  Collapsible,
  HStack,
  Separator,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { icons } from "@neuronhub/shared/theme/icons";
import type { ComponentType } from "react";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import { NeuronLogo } from "@neuronhub/shared/components/NeuronLogo";
import { type LinkProps, NavLink, useLocation } from "react-router";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { useUser } from "@/apps/users/useUserCurrent";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { toast } from "@/utils/toast";

const styles = {
  inline: "gap.sm",

  breakpoint: {
    lg: "xl",
    xl: "2xl",
  },
} as const;

export const layout = {
  label: {
    jobAlerts: (count?: number) => {
      if (count === undefined) {
        return "alerts" as const;
      }
      return `alerts (${count})` as const;
    },
  },
} as const;

export function LayoutSidebar(props: StackProps) {
  const { data } = useApolloQuery(JobAlertListQuery);
  const alertsCount = data?.job_alerts?.length ?? 0;

  const links: Array<SidebarLink> = [
    {
      to: urls.jobs.list,
      icon: icons.job,
      label: "Jobs",
      children:
        alertsCount > 0
          ? [
              {
                label: layout.label.jobAlerts(alertsCount),
                to: urls.jobs.subscriptions,
              },
            ]
          : undefined,
    },
    { to: urls.profiles.list, icon: icons.profiles, label: "Profiles" },
    { to: urls.posts.list, icon: icons.posts, label: "Posts", isHasSeparator: true },
    { to: urls.reviews.list, icon: icons.reviews, label: "Reviews" },
    { to: urls.tools.list, icon: icons.tools, label: "Tools" },
  ] as const;

  return (
    <Stack
      as="aside"
      aria-label="Sidebar"
      p="gap.md"
      bg="bg.panel"
      borderRightWidth="1px"
      justifyContent="space-between"
      maxW={{ base: "2xs", [styles.breakpoint.xl]: "xs" }}
      overflow="auto"
      {...props}
      {...ids.set(ids.layout.sidebar)}
    >
      <Stack as="nav" gap="gap.md">
        <NeuronLogoLinked />

        <Stack as="ul" aria-label="Nav Menu" gap="gap.md">
          <Stack gap="gap.sm">
            <Stack gap="gap.xs">
              {links.map(link => (
                <Bleed
                  as="li"
                  aria-label="Nav Menu Item"
                  key={link.label}
                  inline={styles.inline}
                >
                  {link.isHasSeparator && <Separator my="gap.sm" />}

                  {link.children ? (
                    <SidebarLinkGroup label={link.label} to={link.to} icon={link.icon}>
                      {link.children}
                    </SidebarLinkGroup>
                  ) : (
                    <SidebarLinkButton to={link.to}>
                      <link.icon />
                      {link.label}
                    </SidebarLinkButton>
                  )}
                </Bleed>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <Stack aria-label="User Settings" as="section" gap="gap.sm">
        <Stack gap="gap.sm">
          <Bleed inline={styles.inline}>
            <SidebarLinkButton to={urls.library}>
              <icons.library />
              Archive
            </SidebarLinkButton>
          </Bleed>

          <Bleed inline={styles.inline}>
            <SidebarLinkButton to={urls.user.settings.profile}>
              <icons.settings />
              Settings
            </SidebarLinkButton>
          </Bleed>
        </Stack>

        <Separator mb="gap.md" />

        <UserProfile />
      </Stack>
    </Stack>
  );
}

type SidebarLink = {
  to: LinkProps["to"];
  icon: ComponentType;
  label: string;
  isHasSeparator?: boolean;
  children?: ReadonlyArray<{ label: string; to: LinkProps["to"] }>;
};

/**
 * Also used in another mobile layout in [[LayoutContainer.tsx]]
 */
export function NeuronLogoLinked() {
  return (
    <NavLink aria-label="Logo Link" to={urls.posts.list}>
      <NeuronLogo
        breakpoint={styles.breakpoint.xl}
        chakra={{ alignSelf: "start", w: "fit-content" }}
      />
    </NavLink>
  );
}

function SidebarLinkGroup(props: SidebarLink) {
  const location = useLocation();
  const isInNamespace = location.pathname.startsWith(String(props.to));

  return (
    <Collapsible.Root open={isInNamespace}>
      <HStack w="full">
        <SidebarLinkButton to={props.to}>
          <props.icon />
          {props.label}
        </SidebarLinkButton>
      </HStack>

      <Collapsible.Content>
        <Stack gap="gap.xs" py="gap.xs">
          {props.children?.map(link => (
            <SidebarLinkButton key={link.to.toString()} to={link.to} ps="12">
              {link.label}
            </SidebarLinkButton>
          ))}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function SidebarLinkButton(props: { to: LinkProps["to"] } & ButtonProps) {
  const { children, to, ...buttonProps } = props;
  return (
    <NavLink to={to} style={{ width: "100%" }}>
      {linkProps => (
        <Button
          variant="ghost"
          w="full"
          justifyContent="start"
          gap="3"
          color="fg.muted"
          _hover={{
            bg: "colorPalette.subtle",
            color: "colorPalette.fg",
          }}
          _currentPage={{
            color: "colorPalette.fg",
          }}
          aria-current={linkProps.isActive ? "page" : undefined}
          size={{ base: "xs", [styles.breakpoint.lg]: "md" }}
          {...buttonProps}
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
}
export function UserProfile() {
  const user = useUser();

  async function handleLogout() {
    const res = await mutateAndRefetch(LogoutMutation, {}, { isResetAndRefetchAll: true });
    if (res.success) {
      window.location.reload();
    } else {
      toast.error(`Failed to log out: ${res.errorMessage}`);
    }
  }

  if (!user) {
    return (
      <HStack gap={styles.inline} justify="space-between">
        <NavLink to={urls.login}>
          <Button variant="outline" width="full">
            <LuLogIn />
            Login
          </Button>
        </NavLink>

        <ColorModeButton />
      </HStack>
    );
  }

  return (
    <Stack gap="gap.sm">
      <HStack gap="gap.sm" justify="space-between">
        <HStack gap={{ base: "2", [styles.breakpoint.lg]: "gap.md" }}>
          <Avatar name={user.username} size={{ base: "xs", [styles.breakpoint.lg]: "sm" }} />

          <Box mt="-2px">
            <Text textStyle={{ base: "xs", [styles.breakpoint.lg]: "sm" }} fontWeight="medium">
              {user.username}
            </Text>
            <Text textStyle={{ base: "2xs", [styles.breakpoint.xl]: "sm" }} color="fg.muted">
              {user.email}
            </Text>
          </Box>
        </HStack>

        <ColorModeButton />
      </HStack>
      <Button
        variant="ghost"
        size={{ base: "xs", [styles.breakpoint.lg]: "sm" }}
        onClick={handleLogout}
        colorPalette="gray"
        {...ids.set(ids.auth.logout.btn)}
      >
        <LuLogOut />
        Logout
      </Button>
    </Stack>
  );
}
const LogoutMutation = graphql.persisted("Logout", graphql(`mutation Logout { logout }`));
