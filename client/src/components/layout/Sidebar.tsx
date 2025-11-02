import {
  Bleed,
  Box,
  Button,
  type ButtonProps,
  Collapsible,
  Flex,
  HStack,
  Icon,
  Separator,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { MessageSquareText } from "lucide-react";
import type { ComponentType } from "react";
import toast from "react-hot-toast";
import { FaRegBookmark } from "react-icons/fa6";
import { GoCommentDiscussion } from "react-icons/go";
import { LuLayoutDashboard, LuLibrary, LuLogIn, LuLogOut, LuSettings } from "react-icons/lu";
import { PiGraph } from "react-icons/pi";
import { type LinkProps, NavLink, useLocation } from "react-router";

import { useUser } from "@/apps/users/useUserCurrent";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";

const groups = [
  {
    title: "",
    links: [
      {
        to: urls.posts.list,
        icon: GoCommentDiscussion,
        label: "Posts",
        children: [
          { label: "All", to: urls.posts.list },
          { label: "Knowledge", to: urls.posts.knowledge },
          { label: "Opinion", to: urls.posts.opinion },
          { label: "News", to: urls.posts.news },
          { label: "Question", to: urls.posts.question },
        ] as const,
      },
      { to: urls.tools.list, icon: LuLayoutDashboard, label: "Tools" },
      { to: urls.reviews.list, icon: MessageSquareText, label: "Reviews" },
      { to: "/reading-list", icon: FaRegBookmark, label: "Reading list" },
      { to: "/library", icon: LuLibrary, label: "Library" },
    ] satisfies Array<{
      to: LinkProps["to"];
      icon: ComponentType;
      label: string;
      children?: ReadonlyArray<{ label: string; to: LinkProps["to"] }>;
    }>,
  },
];

export function Sidebar(props: StackProps) {
  const styles = {
    inline: 3,
  };

  return (
    <Stack
      flex="1"
      p={{ base: "4", md: "6" }}
      bg="bg.panel"
      borderRightWidth="1px"
      justifyContent="space-between"
      maxW="xs"
      {...props}
    >
      <Stack gap="6">
        <NavLink to={urls.posts.list}>
          <Bleed
            block="gap.sm"
            inline="gap.sm"
            p="gap.sm"
            _hover={{
              bgColor: "colorPalette.subtle",
            }}
            borderRadius="sm"
          >
            <Flex alignSelf="start" align="center" gap={3} w="fit-content">
              <Icon color="primary" size="xl">
                <PiGraph />
              </Icon>
              <Text fontSize="1.4rem" fontWeight="bold">
                NeuronHub
              </Text>
            </Flex>
          </Bleed>
        </NavLink>

        <Stack gap="6">
          {groups.map((group, index) => (
            <Stack
              // biome-ignore lint/suspicious/noArrayIndexKey: wrong - it's a const ffs
              key={index}
              gap="2"
            >
              {group.title && (
                <Text fontWeight="medium" textStyle="sm">
                  {group.title}
                </Text>
              )}
              <Stack gap="1">
                {group.links.map((link, index) => (
                  <Bleed
                    // biome-ignore lint/suspicious/noArrayIndexKey: wrong
                    key={index}
                    inline={styles.inline}
                  >
                    {link.children ? (
                      <SidebarLinkGroup label={link.label} to={link.to} icon={link.icon}>
                        {link.children}
                      </SidebarLinkGroup>
                    ) : (
                      <SidebarLink to={link.to}>
                        <link.icon />
                        {link.label}
                      </SidebarLink>
                    )}
                  </Bleed>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack gap="4">
        <Stack gap="1" px={0}>
          <Bleed inline={styles.inline}>
            <SidebarLink to={urls.user.settings.profile}>
              <LuSettings />
              Settings
            </SidebarLink>
          </Bleed>
        </Stack>

        <Separator mb={3} />

        <UserProfile />
      </Stack>
    </Stack>
  );
}

function SidebarLink(props: { to: LinkProps["to"] } & ButtonProps) {
  const { children, to, ...buttonProps } = props;
  return (
    <NavLink to={to}>
      {linkProps => (
        <Button
          variant="ghost"
          width="full"
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
          {...buttonProps}
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
}

function SidebarLinkGroup(props: {
  to: LinkProps["to"];
  label: string;
  icon: ComponentType;
  children: ReadonlyArray<{
    to: LinkProps["to"];
    label: string;
  }>;
}) {
  const location = useLocation();
  const isInNamespace = location.pathname.startsWith(String(props.to));

  return (
    <Collapsible.Root open={isInNamespace}>
      <HStack width="full" position="relative">
        <NavLink to={props.to} style={{ flex: 1 }}>
          {linkProps => (
            <Button
              variant="ghost"
              width="full"
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
              pr="10"
            >
              <props.icon />
              {props.label}
            </Button>
          )}
        </NavLink>
      </HStack>

      <Collapsible.Content>
        <Stack gap="1" py="1">
          {props.children.map(link => (
            <SidebarLink key={link.to.toString()} to={link.to} ps="12">
              {link.label}
            </SidebarLink>
          ))}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function UserProfile() {
  const user = useUser();

  async function handleLogout() {
    const res = await mutateAndRefetchMountedQueries(graphql(`mutation Logout { logout }`), {});
    if (res.success) {
      window.location.href = `${env.VITE_SERVER_URL}/admin/login/`;
    } else {
      toast.error(`Failed to log out: ${res.errorMessage}`);
    }
  }

  if (!user) {
    return (
      <HStack gap="3" justify="space-between">
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
    <Stack gap="3">
      <HStack gap="3" justify="space-between">
        <HStack gap="3">
          <Avatar name={user.username} />
          <Box>
            <Text textStyle="sm" fontWeight="medium">
              {user.username}
            </Text>
            <Text textStyle="sm" color="fg.muted">
              {user.email}
            </Text>
          </Box>
        </HStack>
        <ColorModeButton />
      </HStack>
      <Button
        variant="ghost"
        size="sm"
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
