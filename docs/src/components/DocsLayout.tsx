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
  Text,
} from "@chakra-ui/react";
import { LuFolder, LuMenu, LuUser } from "react-icons/lu";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NeuronLogo } from "@neuronhub/shared/components/NeuronLogo";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { env } from "@/env";
import { type NavNode, navTree, findFirstChildHrefRecursively } from "@/components/buildNavTree";
import { Toc } from "@/components/Toc";
import { ids } from "@/e2e/ids";

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
          <Container maxW="7xl" py={style.p}>
            <Stack direction={{ base: "column-reverse", xl: "row" }} gap="8" flex="1">
              <Box flex="1">
                <Prose data-toc-root pb="10vh" variant="content-main">
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
  p: 6,
  sidebar: {
    width: "18rem",
  },
} as const;

function SidebarContent() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  const activeSection: SectionKey = pathname.startsWith("/development/")
    ? "development"
    : "usage";
  const nodes = navTree.find(node => node.slug === activeSection)?.children ?? [];

  return (
    <Box
      {...ids.set(ids.sidebar.root)}
      h="full"
      overflowY="auto"
      ps="2"
      pe="2"
      pt={style.p}
      pb="10"
      px="5"
    >
      <Stack gap="6" align="flex-start">
        <chakra.a
          href={env.VITE_CLIENT_URL}
          {...ids.set(ids.sidebar.logo)}
          aria-label="NeuronHub"
          display="flex"
        >
          <NeuronLogo breakpoint="2xl" />
        </chakra.a>

        <SectionTabs
          value={activeSection}
          onValueChange={section => {
            const node = navTree.find(node => node.slug === section);
            const href = node ? findFirstChildHrefRecursively(node.children) : "/";
            navigate(href ?? "/");
          }}
        />

        <NavTreeList pathname={pathname} nodes={nodes} depth={0} />
      </Stack>
    </Box>
  );
}

function SectionTabs(props: { value: SectionKey; onValueChange: (value: SectionKey) => void }) {
  return (
    <Tabs.Root
      value={props.value}
      onValueChange={e => props.onValueChange(e.value as SectionKey)}
      variant="plain"
      size="sm"
    >
      <Tabs.List bg="bg.muted" rounded="l3" p="1" flex="1">
        {Object.entries(sectionTabs).map(([value, section]) => (
          <Tabs.Trigger
            key={value}
            value={value}
            minW="fit-content"
            flex="1"
            _hover={{
              bg:
                props.value === value
                  ? { _light: "bg.muted/30", _dark: "bg.muted/40" }
                  : "bg/50",
            }}
            transition="backgrounds"
            transitionDuration="faster"
          >
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

type SectionKey = keyof typeof sectionTabs;

const sectionTabs = {
  usage: { label: "Usage", icon: LuUser },
  development: { label: "Development", icon: LuFolder },
} as const;

function NavTreeList(props: { pathname: string; nodes: NavNode[]; depth: number }) {
  return (
    <Stack w="full" gap={props.depth === 0 ? "6" : "0"}>
      {props.nodes.map(node => (
        <NavTreeNode key={node.slug} pathname={props.pathname} node={node} depth={props.depth} />
      ))}
    </Stack>
  );
}

function NavTreeNode(props: { pathname: string; node: NavNode; depth: number }) {
  const isLeaf = props.node.children.length === 0;

  if (props.depth === 0) {
    return (
      <Stack gap="3">
        {props.node.href ? (
          <SideNavLink
            href={props.node.href}
            data-current={props.pathname === props.node.href ? "" : undefined}
          >
            <Heading as="h5" textStyle="sm">
              {props.node.title}
            </Heading>
          </SideNavLink>
        ) : (
          <Heading as="h5" textStyle="sm">
            {props.node.title}
          </Heading>
        )}
        {props.node.children.length > 0 && (
          <NavTreeList pathname={props.pathname} nodes={props.node.children} depth={1} />
        )}
      </Stack>
    );
  }

  if (isLeaf || props.node.href) {
    return (
      <>
        <SideNavLink
          href={props.node.href}
          variant="line"
          size="md"
          ps={4 + (props.depth - 1) * 3}
          data-current={props.pathname === props.node.href ? "" : undefined}
        >
          <Span flex="1">{props.node.title}</Span>
        </SideNavLink>
        {props.node.children.length > 0 && (
          <NavTreeList
            pathname={props.pathname}
            nodes={props.node.children}
            depth={props.depth + 1}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Text
        textStyle="xs"
        fontWeight="medium"
        color="fg.muted"
        ps={4 + (props.depth - 1) * 3}
        pt="2"
        pb="1"
      >
        {props.node.title}
      </Text>
      <NavTreeList
        pathname={props.pathname}
        nodes={props.node.children}
        depth={props.depth + 1}
      />
    </>
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
