import {
  Badge,
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
import { FaRegBookmark } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
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
import { toast } from "@/utils/toast";

const styles = {
  inline: "gap.sm",
  breakpoint: "xl",
};

export function LayoutSidebar(props: StackProps) {
  const user = useUser();

  const links: Array<SidebarLink> = [
    { to: urls.profiles.list, icon: FiUsers, label: "Profiles" },
    { to: urls.posts.list, icon: GoCommentDiscussion, label: "Posts" },
    { to: urls.tools.list, icon: LuLayoutDashboard, label: "Tools" },
    { to: urls.reviews.list, icon: MessageSquareText, label: "Reviews" },
  ];
  if (user) {
    links.push(
      // { to: urls.readingList, icon: FaRegBookmark, label: "Reading list" },
      { to: urls.library, icon: LuLibrary, label: "Library" },
    );
  }

  return (
    <Stack
      as="aside"
      aria-label="Sidebar"
      p="gap.md"
      bg="bg.panel"
      borderRightWidth="1px"
      justifyContent="space-between"
      maxW="xs"
      overflow="auto"
      {...props}
    >
      <Stack as="nav" gap="gap.md">
        <NeuronLogo />

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

type SidebarLink = {
  to: LinkProps["to"];
  icon: ComponentType;
  label: string;
  children?: ReadonlyArray<{ label: string; to: LinkProps["to"] }>;
};

/**
 * Also used in another mobile layout in [[LayoutContainer.tsx]]
 */
export function NeuronLogo() {
  return (
    <NavLink aria-label="Logo Link" to={urls.posts.list}>
      <Bleed
        display="flex"
        gap="gap.sm"
        block="gap.sm"
        inline="gap.sm"
        p={{ base: "1px", [styles.breakpoint]: "gap.sm" }}
        _hover={{
          bgColor: "colorPalette.subtle",
        }}
        borderRadius="sm"
      >
        <Flex alignSelf="start" align="center" gap="3" w="fit-content">
          <Icon color="primary" size="xl">
            <PiGraph />
          </Icon>
          <Text fontSize={{ base: "lg", [styles.breakpoint]: "1.4rem" }} fontWeight="bold">
            NeuronHub
          </Text>
        </Flex>

        <Badge h="fit-content" size="xs" textTransform="uppercase">
          Alpha
        </Badge>
      </Bleed>
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
          size={{ base: "xs", [styles.breakpoint]: "md" }}
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
        <HStack gap={{ base: "2", [styles.breakpoint]: "gap.md" }}>
          <Avatar name={user.username} size={{ base: "xs", [styles.breakpoint]: "sm" }} />

          <Box mt="-2px">
            <Text textStyle={{ base: "xs", [styles.breakpoint]: "sm" }} fontWeight="medium">
              {user.username}
            </Text>
            <Text textStyle={{ base: "2xs", [styles.breakpoint]: "sm" }} color="fg.muted">
              {user.email}
            </Text>
          </Box>
        </HStack>

        <ColorModeButton />
      </HStack>
      <Button
        variant="ghost"
        size={{ base: "xs", [styles.breakpoint]: "sm" }}
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
