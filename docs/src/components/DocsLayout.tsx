/**
 * #AI
 */
"use client";

import {
  Box,
  Button,
  Container,
  chakra,
  Drawer,
  Flex,
  Heading,
  HStack,
  Icon,
  Portal,
  Span,
  Stack,
  Tabs,
} from "@chakra-ui/react";
import { LuFolder, LuMenu, LuUser } from "react-icons/lu";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NeuronLogo } from "@neuronhub/shared/components/NeuronLogo";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { env } from "@/env";
import { type NavGroup, navGroups } from "@/components/buildNavGroups";
import { Toc } from "@/components/Toc";

export default function DocsLayout() {
  return (
    <>
      <MobileNavbar />
      <Flex flex="1">
        <Box
          width={style.sidebar.width}
          position="fixed"
          zIndex="20"
          top="0"
          insetStart="0"
          bottom="0"
          hideBelow="lg"
          borderEndWidth="1px"
          bg="bg"
        >
          <SidebarContent />
        </Box>

        <Box marginStart={{ lg: style.sidebar.width }} flex="1">
          <Container maxW="7xl" py="12">
            <Stack direction={{ base: "column-reverse", xl: "row" }} gap="8" flex="1">
              <Box flex="1">
                <Prose data-toc-root pb="100vh">
                  <Outlet />
                </Prose>
              </Box>

              <Box
                position={{ base: "unset", xl: "sticky" }}
                top="6"
                alignSelf="flex-start"
                overflowY="auto"
                width={{ base: "full", xl: "xs" }}
                maxH="calc(100vh - 3rem)"
              >
                <Toc />
              </Box>
            </Stack>
          </Container>
        </Box>
      </Flex>
    </>
  );
}

const style = {
  sidebar: {
    width: "18rem",
  },
} as const;

function SidebarContent() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const activeSection = pathname.startsWith("/development/") ? "development" : "user";
  const groups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.href.startsWith(`/${activeSection}/`)) }))
    .filter(g => g.items.length > 0);

  return (
    <Box data-sidebar h="full" overflowY="auto" ps="2" pe="2" pt="4" pb="10" px="5">
      <Stack gap="6" align="flex-start">
        <chakra.a href={env.VITE_CLIENT_URL} aria-label="NeuronHub" display="flex">
          <NeuronLogo breakpoint="2xl" />
        </chakra.a>

        <SectionTabs
          value={activeSection}
          onValueChange={section => navigate(sectionTabs[section].firstHref)}
        />

        <NavGroupList pathname={pathname} groups={groups} />
      </Stack>
    </Box>
  );
}

function SectionTabs(props: { value: string; onValueChange: (value: string) => void }) {
  return (
    <Tabs.Root
      value={props.value}
      onValueChange={e => props.onValueChange(e.value)}
      variant="plain"
      size="sm"
    >
      <Tabs.List bg="bg.muted" rounded="l3" p="1" flex="1">
        {Object.entries(sectionTabs).map(([key, section]) => (
          <Tabs.Trigger key={key} value={key} minW="fit-content" flex="1">
            <Icon>
              <section.icon />
            </Icon>
            {section.label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
    </Tabs.Root>
  );
}

const sectionTabs: Record<
  string,
  { label: string; icon: React.ComponentType; firstHref: string }
> = {
  user: { label: "Usage", icon: LuUser, firstHref: "/user/how-to/algolia" },
  development: {
    label: "Development",
    icon: LuFolder,
    firstHref: "/development/how-to/git-commits",
  },
};

function NavGroupList(props: { pathname: string; groups: Array<NavGroup> }) {
  return (
    <Stack w="full" gap="6">
      {props.groups.map(group => (
        <Stack key={group.title} gap="3">
          <HStack>
            <Heading as="h5" textStyle="sm">
              {group.title}
            </Heading>
          </HStack>
          <Stack gap="0">
            {group.items.map(item => (
              <SideNavLink
                key={item.href}
                href={item.href}
                variant="line"
                size="md"
                data-current={props.pathname === item.href || undefined}
              >
                <Span flex="1">{item.title}</Span>
              </SideNavLink>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function MobileNavbar() {
  return (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <Button
          size="sm"
          hideFrom="lg"
          variant="plain"
          colorPalette="gray"
          aria-label="Open menu"
          m="2"
        >
          <HStack>
            <LuMenu />
            <Heading textStyle="sm" fontWeight="medium" color="fg">
              Docs
            </Heading>
          </HStack>
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <SidebarContent />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

const SideNavLink = chakra("a", {
  base: {
    gap: "3",
    display: "flex",
    textStyle: "sm",
    alignItems: "center",
    textDecoration: "none",
    transitionProperty: "color, border-color",
    transitionDuration: "normal",
    transitionTimingFunction: "default",
    focusVisibleRing: "inside",
    focusRingWidth: "2px",
    _current: {
      fontWeight: "medium",
      color: "colorPalette.fg",
    },
  },
  variants: {
    variant: {
      line: {
        borderStartWidth: "1px",
        borderStartColor: "bg.muted",
        _hover: { borderStartColor: "bg.emphasized" },
        _current: { borderStartColor: "colorPalette.fg!" },
      },
    },
    size: {
      sm: { px: "2", py: "1" },
      md: { px: "4", py: "1.5" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
