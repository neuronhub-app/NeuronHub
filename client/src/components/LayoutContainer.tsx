import { Container, Flex, HStack, IconButton, Link, Stack } from "@chakra-ui/react";
import type { ReactNode, SVGProps } from "react";
import { LuAlignRight } from "react-icons/lu";
import { NavLink, Outlet } from "react-router";
import { highlighter } from "@/apps/highlighter/highlighter";
import { LayoutSidebar } from "@/components/LayoutSidebar";
import {
  DrawerBackdrop,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { urls } from "@/urls";

const style = {
  breakpoint: "md",
} as const;

export function LayoutContainer(props?: { children?: ReactNode }) {
  const highlight = highlighter.useHook();
  return (
    <>
      <Navbar />

      <Flex flex="1" pos="relative" h="full">
        <LayoutSidebar
          hideBelow={style.breakpoint}
          maxH="100vh"
          minH="100vh"
          pos="sticky"
          top={0}
        />

        <Stack as="main" flex="1" alignItems="stretch" bg="bg.subtle">
          <Container maxW="7xl" mt={6} h="full" pb="gap.xl">
            {props?.children ?? <Outlet />}
            <highlight.component />
          </Container>
        </Stack>
      </Flex>
    </>
  );
}

function Navbar() {
  return (
    <Container py="2.5" borderBottomWidth="1px" hideFrom={style.breakpoint}>
      <HStack justify="space-between">
        <Link asChild w="fit-content">
          <NavLink to={urls.posts.list}>
            <NeuronLogo />
          </NavLink>
        </Link>

        <DrawerRoot placement="start">
          <DrawerTrigger asChild>
            <IconButton aria-label="Open Menu" variant="ghost" colorPalette="gray">
              <LuAlignRight />
            </IconButton>
          </DrawerTrigger>

          <DrawerBackdrop />

          <DrawerContent>
            <DrawerCloseTrigger colorPalette="gray" />
            <LayoutSidebar />
          </DrawerContent>
        </DrawerRoot>
      </HStack>
    </Container>
  );
}

function NeuronLogo(props: SVGProps<SVGSVGElement>) {
  return (
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
}
