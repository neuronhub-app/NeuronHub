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
  IconButton,
  Portal,
  Span,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { GoCommandPalette, GoPerson, GoMail } from "react-icons/go";
import { LuMenu } from "react-icons/lu";
import { Outlet, useLocation, useNavigate } from "react-router";

import { getProseHeadingStyle, Prose } from "@neuronhub/shared/components/ui/prose";

import { BadgeNew } from "@/components/BadgeNew";
import { CodeBlockShikiAdapter } from "@/components/CodeBlockShikiAdapter";
import { ids } from "@/e2e/ids";
import {
  type NavNode,
  navTree,
  pageLinks,
  filterNavBySite,
  findFirstChildHrefRecursively,
} from "@/layout/buildNavTree";
import { ColorModeButton } from "@/layout/ColorModeButton";
import { DocsSearch } from "@/layout/DocsSearch";
import { site } from "@/layout/siteState";
import { SiteSwitcher } from "@/layout/SiteSwitcher";
import { Toc } from "@/layout/Toc";
import { ReactRouterPath } from "@/utils/types";

export default function DocsLayout() {
  const location = useLocation();
  const siteCurrent = site.useCurrent();

  useEffect(() => site.hydrate(), []);
  useEffect(() => site.reflectInUrl(siteCurrent), [siteCurrent, location.pathname]);

  return (
    <>
      <SidebarMobileDrawer />
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
          <SidebarLeft />
        </Box>

        <Box
          marginStart={{ lg: style.sidebar.width }}
          flex="1"
          overflowX={{ base: "hidden", xl: "clip" }}
        >
          <Container maxW="7xl" py={style.p} pt={{ base: 0, lg: style.p }}>
            <Heading
              as="h1"
              {...getProseHeadingStyle()}
              fontSize={{ base: "1.4em", xl: "1.6em" }}
              fontWeight="bold"
              letterSpacing="-0.01em"
              lineHeight="1.5em"
              marginBottom="0.4em"
            >
              {pageLinks.get(location.pathname as ReactRouterPath)?.title}
            </Heading>
            <Stack direction={{ base: "column", xl: "row" }} gap="8" flex="1">
              <Box
                order={{ base: -1, xl: 1 }}
                position={{ base: "unset", xl: "sticky" }}
                top="6"
                alignSelf="flex-start"
                overflowY="auto"
                width={{ base: "full", xl: "xs" }}
                maxH={{ xl: "calc(100vh - 3rem)" }}
              >
                <Toc />
              </Box>

              <Box flex="1" minW={0}>
                <Prose data-toc-root pb="10vh" variant="content-main">
                  <CodeBlockShikiAdapter>
                    <Outlet />
                  </CodeBlockShikiAdapter>
                </Prose>
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

function SidebarLeft() {
  const siteCurrent = site.useCurrent();

  return (
    <Box
      {...ids.set(ids.sidebar.root)}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      h="full"
      pt={style.p}
      pb="gap.md"
      px="5"
    >
      <Stack flex="1" gap="6" align="flex-start">
        <SiteSwitcher site={siteCurrent} />

        <DocsSearch />

        <SidebarLeftPages />
      </Stack>

      <HStack mt="auto" pt="gap.md" borderTopWidth="1px" justify="space-between">
        <HStack>
          <IconButton
            asChild
            aria-label="GitHub repository"
            variant="ghost"
            colorPalette="gray"
            size="md"
          >
            <a
              href="https://github.com/neuronhub-app/NeuronHub"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub />
            </a>
          </IconButton>
          <IconButton
            asChild
            aria-label="Send feedback"
            variant="ghost"
            colorPalette="gray"
            size="md"
          >
            <a href="mailto:support@neuronhub.app">
              <GoMail />
            </a>
          </IconButton>
        </HStack>

        <ColorModeButton />
      </HStack>
    </Box>
  );
}

const sidebarTabs = {
  usage: { label: "Usage", icon: GoPerson },
  development: { label: "Development", icon: GoCommandPalette },
} as const;

type SidebarTabId = keyof typeof sidebarTabs;

function SidebarLeftPagesTabs(props: {
  value: SidebarTabId;
  onValueChange: (value: SidebarTabId) => void;
}) {
  return (
    <Tabs.Root
      value={props.value}
      onValueChange={details => props.onValueChange(details.value as SidebarTabId)}
      variant="plain"
      size="sm"
      w="full"
    >
      <Tabs.List bg="bg.muted" rounded="l3" p="1" flex="1" w="full">
        {Object.entries(sidebarTabs).map(([value, section]) => (
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

function SidebarLeftPages() {
  const pathname = useLocation().pathname;

  const navigate = useNavigate();
  const siteCurrent = site.useCurrent();

  const sectionActive = pathname.startsWith("/development/") ? "development" : "usage";
  const navTreeForSite = filterNavBySite(navTree, siteCurrent);

  return (
    <>
      <SidebarLeftPagesTabs
        value={sectionActive}
        onValueChange={section => {
          const node = navTreeForSite.find(node => node.slug === section);
          const href = node ? findFirstChildHrefRecursively(node.children) : "/";
          navigate(href ?? "/");
        }}
      />
      <SidebarLeftPagesTree
        pathname={pathname}
        nodes={navTreeForSite.find(node => node.slug === sectionActive)?.children ?? []}
        depth={0}
      />
    </>
  );
}

function SidebarLeftPagesTree(props: { pathname: string; nodes: NavNode[]; depth: number }) {
  return (
    <Stack w="full" gap={props.depth === 0 ? "6" : "0"}>
      {props.nodes.map(node => (
        <SidebarLeftPagesNode
          key={node.slug}
          pathname={props.pathname}
          node={node}
          depth={props.depth}
        />
      ))}
    </Stack>
  );
}

function SidebarLeftPagesNode(props: { pathname: string; node: NavNode; depth: number }) {
  const isLeaf = props.node.children.length === 0;

  if (props.depth === 0) {
    return (
      <Stack gap="3">
        {props.node.href ? (
          <SidebarLink
            href={props.node.href}
            data-current={props.pathname === props.node.href ? "" : undefined}
            w="fit-content"
          >
            <Heading as="h5" textStyle="sm">
              {props.node.title}
            </Heading>

            {props.node.isNewBadge && <BadgeNew />}
          </SidebarLink>
        ) : (
          <HStack w="fit-content">
            <Heading as="h5" textStyle="sm">
              {props.node.title}
            </Heading>
            {props.node.isNewBadge && <BadgeNew />}
          </HStack>
        )}
        {props.node.children.length > 0 && (
          <SidebarLeftPagesTree
            pathname={props.pathname}
            nodes={props.node.children}
            depth={1}
          />
        )}
      </Stack>
    );
  }

  if (isLeaf || props.node.href) {
    return (
      <>
        <SidebarLink
          href={props.node.href}
          variant="line"
          size="md"
          w="fit-content"
          ps={4 + (props.depth - 1) * 3}
          data-current={props.pathname === props.node.href ? "" : undefined}
        >
          <Span flex="1">{props.node.title}</Span>

          {props.node.isNewBadge && <BadgeNew />}
        </SidebarLink>

        {props.node.children.length > 0 && (
          <SidebarLeftPagesTree
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

      <SidebarLeftPagesTree
        pathname={props.pathname}
        nodes={props.node.children}
        depth={props.depth + 1}
      />
    </>
  );
}

function SidebarMobileDrawer() {
  return (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <Button
          {...ids.set(ids.sidebar.burgerBtn)}
          size="md"
          hideFrom="lg"
          variant="plain"
          colorPalette="gray"
          aria-label="Open menu"
          m="2"
          px="1"
        >
          <HStack>
            <Icon size="lg">
              <LuMenu />
            </Icon>
            <Heading textStyle="md" fontWeight="medium" color="fg">
              NeuronHub
            </Heading>
          </HStack>
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <SidebarLeft />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

const SidebarLink = chakra("a", {
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
