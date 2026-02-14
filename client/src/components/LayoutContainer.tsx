import { Container, Flex, HStack, IconButton, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuAlignRight } from "react-icons/lu";
import { Outlet, useLocation } from "react-router";
import { HighlightActionBar } from "@/apps/highlighter/HighlightActionBar";
import { LayoutSidebar, NeuronLogo } from "@/components/LayoutSidebar";
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
  const location = useLocation();

  const isHasBackground = !location.pathname.startsWith(urls.posts.list);
  return (
    <>
      <NavbarMobile />

      <Flex flex="1" pos="relative" h="full" bg={isHasBackground ? "bg.muted" : ""}>
        <LayoutSidebar
          hideBelow={style.breakpoint}
          maxH="100vh"
          minH="100vh"
          pos="sticky"
          top={0}
        />

        <Stack as="main" flex="1" alignItems="stretch">
          <Container mt={6} h="full" pb="gap.xl">
            {props?.children ?? <Outlet />}

            <HighlightActionBar />
          </Container>
        </Stack>
      </Flex>
    </>
  );
}

function NavbarMobile() {
  return (
    <Container py="2.5" borderBottomWidth="1px" hideFrom={style.breakpoint}>
      <HStack justify="space-between">
        <NeuronLogo />

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
