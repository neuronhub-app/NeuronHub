import { UserCurrentBox } from "@/apps/users/UserCurrentBox";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Flex, VStack } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { getYear } from "date-fns";
import { Webhook } from "lucide-react";
import { Outlet } from "react-router";

export function RootLayout() {
  const padding = 6;

  return (
    <VStack h="100vh" gap={0} bg={{ base: "white", _dark: "black" }}>
      <Flex w="100%" align="flex-start">
        <VStack
          id="sidebar"
          as="aside"
          flex={0}
          alignItems="flex-start"
          justify="space-between"
          p={padding}
          h="100%"
          borderRight="1px solid"
          borderColor="gray.5"
        >
          <Flex
            id="sidebar-logo"
            direction="row"
            align="center"
            gap={2}
            fontWeight="bold"
            fontSize="xl"
          >
            <Icon color="blue.9" size="lg">
              <Webhook />
            </Icon>
            <Text>NeuronHub</Text>
          </Flex>

          <Flex justify="space-between" w="full">
            <UserCurrentBox />
            <ColorModeButton />
          </Flex>
        </VStack>

        <VStack as="main" flex={4} alignItems="flex-start" p={padding} w="100%">
          {<Outlet />}
        </VStack>
      </Flex>

      <Flex
        id="footer"
        as="footer"
        flex={0}
        direction="column"
        w="100%"
        h="100%"
        align="flex-end"
        p={padding}
        borderTop="1px solid"
        borderColor="gray.5"
      >
        <Text fontSize="sm" color="gray.7">
          © {getYear(new Date())} NeuronHub
        </Text>
      </Flex>
    </VStack>
  );
}
