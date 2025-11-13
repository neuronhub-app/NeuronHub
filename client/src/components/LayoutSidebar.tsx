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
import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/urls";

const links: Array<SidebarLink> = [
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
];

type SidebarLink = {
  to: LinkProps["to"];
  icon: ComponentType;
  label: string;
  children?: ReadonlyArray<{ label: string; to: LinkProps["to"] }>;
};

const styles = {
  inline: 3,
};

export function LayoutSidebar(props: StackProps) {
  return (
    <Stack
      as="aside"
      aria-label="Sidebar"
      flex={{ base: "", xl: "1" }}
      p={{ base: "gap.sm", md: "gap.md" }}
      bg="bg.panel"
      borderRightWidth="1px"
      justifyContent="space-between"
      maxW="xs"
      overflow="auto"
      {...props}
    >
      <Stack as="nav" gap="gap.md">
        <NavLink aria-label="Logo Link" to={urls.posts.list}>
          <Bleed
            block="gap.sm"
            inline="gap.sm"
            p="gap.sm"
            _hover={{
              bgColor: "colorPalette.subtle",
            }}
            borderRadius="sm"
          >
            <Flex alignSelf="start" align="center" gap="3" w="fit-content">
              <Icon color="primary" size="xl">
                <PiGraph />
              </Icon>
              <Text fontSize={{ base: "sm", md: "md", xl: "1.4rem" }} fontWeight="bold">
                NeuronHub
              </Text>
            </Flex>
          </Bleed>
        </NavLink>

        <Stack as="ul" aria-label="Nav Menu" gap="gap.md">
          <Stack gap="gap.sm">
            <Stack gap="gap.xs">
              {links.map((link, index) => (
                <Bleed
                  as="li"
                  aria-label="Nav Menu Item"
                  // biome-ignore lint/suspicious/noArrayIndexKey: wrong
                  key={index}
                  inline={styles.inline}
                >
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
        <Stack gap="gap.sm" px={0}>
          <Bleed inline={styles.inline}>
            <SidebarLinkButton to={urls.user.settings.profile}>
              <LuSettings />
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

function SidebarLinkButton(props: { to: LinkProps["to"] } & ButtonProps) {
  const { children, to, ...buttonProps } = props;
  return (
    <NavLink to={to}>
      {linkProps => (
        <Button
          variant="ghost"
          width="full"
          justifyContent="start"
          gap={styles.inline}
          color="fg.muted"
          _hover={{
            bg: "colorPalette.subtle",
            color: "colorPalette.fg",
          }}
          _currentPage={{
            color: "colorPalette.fg",
          }}
          aria-current={linkProps.isActive ? "page" : undefined}
          size={{ base: "sm", xl: "md" }}
          fontSize={{ base: "sm", xl: "" }}
          {...buttonProps}
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
}

function SidebarLinkGroup(props: SidebarLink) {
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

export function UserProfile() {
  const user = useUser();

  async function handleLogout() {
    const res = await mutateAndRefetch(
      graphql.persisted("Logout", graphql(`mutation Logout { logout }`)),
      {},
      { isResetAndRefetchAll: true },
    );
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
