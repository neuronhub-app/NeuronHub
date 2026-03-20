import { Container, Flex, Stack } from "@chakra-ui/react";
import { Outlet } from "react-router";

export default function PgLayoutNoHeader() {
  return (
    <Flex flex="1" direction="column" h="full" bg="bg">
      <Stack as="main" flex="1" alignItems="stretch">
        <Container pb="30px" px={{ base: "gap.sm", md: "6" }} h="auto">
          <Outlet />
        </Container>
      </Stack>
    </Flex>
  );
}
