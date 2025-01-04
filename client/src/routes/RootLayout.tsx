import { Logo, Sidebar } from "@/components/layout/Sidebar";
import {
  DrawerBackdrop,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Flex, Stack } from "@chakra-ui/react";
import {
  Container,
  type ContainerProps,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { LuAlignRight } from "react-icons/lu";
import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <>
      <Navbar hideFrom="md" />

      <Flex flex="1" pos="relative">
        <Sidebar hideBelow="md" maxH="100vh" pos="sticky" top={0} />

        <Stack pb="12" flex="1" alignItems="stretch">
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
    <Container
      py="2.5"
      background="bg.panel"
      borderBottomWidth="1px"
      {...props}
    >
      <HStack justify="space-between">
        <Logo />

        <DrawerRoot placement="start">
          <DrawerTrigger asChild>
            <IconButton
              aria-label="Open Menu"
              variant="ghost"
              colorPalette="gray"
            >
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
