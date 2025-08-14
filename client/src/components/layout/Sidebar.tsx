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
import { FaRegBookmark } from "react-icons/fa6";
import { GoCommentDiscussion } from "react-icons/go";
import { LuLayoutDashboard, LuLibrary, LuSettings } from "react-icons/lu";
import { PiGraph } from "react-icons/pi";
import { type LinkProps, NavLink } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColorModeButton } from "@/components/ui/color-mode";
import { urls } from "@/routes";

const groups = [
  {
    title: "",
    links: [
      { to: "/tools", icon: LuLayoutDashboard, label: "Tools" },
      { to: urls.posts.list, icon: GoCommentDiscussion, label: "Posts" },
      { to: urls.reviews.list, icon: MessageSquareText, label: "Reviews" },
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

function UserProfile() {
  const user = useUser();

  return (
    <HStack gap="3" justify="space-between">
      <HStack gap="3">
        {/*<Avatar src="https://i.pravatar.cc/300" />*/}
        <Avatar name={user?.name} />
        <Box>
          <Text textStyle="sm" fontWeight="medium">
            {user?.name}
          </Text>
          <Text textStyle="sm" color="fg.muted">
            {user?.email}
          </Text>
        </Box>
      </HStack>
      <ColorModeButton />
    </HStack>
  );
}
