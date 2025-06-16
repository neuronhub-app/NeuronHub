import {
  Bleed,
  Box,
  type ButtonProps,
  Flex,
  HStack,
  Icon,
  Separator,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import { MessageSquareText } from "lucide-react";
import type { SVGProps } from "react";
import { FaRegBookmark } from "react-icons/fa6";
import { GoCommentDiscussion } from "react-icons/go";
import { LuLayoutDashboard, LuLibrary, LuSettings } from "react-icons/lu";
import { PiGraph } from "react-icons/pi";
import { type LinkProps, NavLink } from "react-router";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColorModeButton } from "@/components/ui/color-mode";
import { urls } from "@/routes";

const groups = [
  {
    title: "",
    links: [
      { to: "/tools", icon: LuLayoutDashboard, label: "Tools" },
      { to: "/posts", icon: GoCommentDiscussion, label: "Posts" },
      { to: "/reviews", icon: MessageSquareText, label: "Reviews" },
      { to: "/reading-list", icon: FaRegBookmark, label: "Reading list" },
      { to: "/library", icon: LuLibrary, label: "Library" },
    ],
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
        <Flex alignSelf="start" align="center" gap={3}>
          <Icon color="primary" size="xl">
            <PiGraph />
          </Icon>
          <Text fontSize="1.4rem" fontWeight="bold">
            NeuronHub
          </Text>
        </Flex>
        <Stack gap="6">
          {groups.map((group, index) => (
            <Stack key={index as any} gap="2">
              {group.title && (
                <Text fontWeight="medium" textStyle="sm">
                  {group.title}
                </Text>
              )}
              <Stack gap="1">
                {group.links.map((link, index) => (
                  <Bleed key={index as any} inline={styles.inline}>
                    <SidebarLink to={link.to}>
                      <link.icon />
                      {link.label}
                    </SidebarLink>
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
            <SidebarLink to={urls.user.settings.profile.path}>
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

function SidebarLink(props: { to?: LinkProps["to"] } & ButtonProps) {
  const { children, to, ...buttonProps } = props;
  return (
    <NavLink to={to ?? "/"}>
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

export const UserProfile = () => {
  const userQuery = useUserCurrent();

  return (
    <HStack gap="3" justify="space-between">
      <HStack gap="3">
        {/*<Avatar src="https://i.pravatar.cc/300" />*/}
        <Avatar name={userQuery?.user?.name} />
        <Box>
          <Text textStyle="sm" fontWeight="medium">
            {userQuery?.user?.name}
          </Text>
          <Text textStyle="sm" color="fg.muted">
            {userQuery?.user?.email}
          </Text>
        </Box>
      </HStack>
      <ColorModeButton />
    </HStack>
  );
};

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height="28"
    viewBox="0 0 143 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>NeuronHub</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.127 0C15.466 0 11.2287 1.69492 7.83887 4.23729L30.9321 31.9915L49.788 17.7966C48.9406 7.83898 40.466 0 30.0846 0"
      fill="var(--chakra-colors-color-palette-solid)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M30.0847 50C41.1017 50 50 41.1017 50 30.0847V29.0254L32.839 41.7373C30.9322 43.2203 28.178 42.7966 26.6949 41.1017L2.11864 11.4407C0.847458 13.983 0 16.9491 0 19.9152V29.8729C0 40.8898 8.89831 49.7881 19.9153 49.7881"
      fill="var(--chakra-colors-color-palette-emphasized)"
    />
  </svg>
);
