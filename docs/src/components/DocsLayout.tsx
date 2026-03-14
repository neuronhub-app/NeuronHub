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
  Portal,
  Span,
  Stack,
} from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";
import { Outlet, useLocation } from "react-router";
import { navGroups } from "./buildNavGroups";
import { Prose } from "./Prose";
import { Toc } from "./Toc";

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

  return (
    <Box data-sidebar h="full" overflowY="auto" ps="2" pe="2" pt="4" pb="10">
      <Stack gap="6" align="flex-start">
        <Box w="full" px="4">
          <Heading size="lg">Docs</Heading>
        </Box>

        <Stack w="full" gap="6">
          {navGroups.map(group => (
            <Stack key={group.title} gap="3">
              <HStack px="4">
                <Heading as="h5" textStyle="sm">
                  {group.title}
                </Heading>
              </HStack>
              <Stack px="4" gap="0">
                {group.items.map(item => (
                  <SideNavLink
                    key={item.href}
                    href={item.href}
                    variant="line"
                    size="md"
                    data-current={pathname === item.href || undefined}
                  >
                    <Span flex="1">{item.title}</Span>
                  </SideNavLink>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
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
