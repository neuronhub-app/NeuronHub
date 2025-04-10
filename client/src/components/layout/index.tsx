import { Logo, Sidebar } from "@/components/layout/Sidebar";
import {
  DrawerBackdrop,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Flex, Stack } from "@chakra-ui/react";
import { Container, type ContainerProps, HStack, IconButton } from "@chakra-ui/react";
import { LuAlignRight } from "react-icons/lu";
import { Outlet } from "react-router";

export function links() {
  return [
    // {
    //   rel: "icon",
    //   href: "/favicon.png",
    //   type: "image/png",
    // },
  ];
}

export default function RootLayout() {
  return (
    <>
      <Navbar hideFrom="md" />

      <Flex flex="1" pos="relative" h="full">
        <Sidebar hideBelow="md" maxH="100vh" minH="100vh" pos="sticky" top={0} />

        <Stack pb="12" flex="1" alignItems="stretch" bg="bg.subtle">
          <Container maxW="7xl" mt={6}>
            {<Outlet />}
          </Container>
        </Stack>
      </Flex>
    </>
  );
}

export function Navbar(props: ContainerProps) {
  return (
    <Container py="2.5" borderBottomWidth="1px" {...props}>
      <HStack justify="space-between">
        <Logo />

        <DrawerRoot placement="start">
          <DrawerTrigger asChild>
            <IconButton aria-label="Open Menu" variant="ghost" colorPalette="gray">
              <LuAlignRight />
            </IconButton>
          </DrawerTrigger>
          <DrawerBackdrop />
          <DrawerContent>
            <DrawerCloseTrigger colorPalette="gray" />
            <Sidebar />
          </DrawerContent>
        </DrawerRoot>
      </HStack>
    </Container>
  );
}
