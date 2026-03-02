import { Container, Flex, Heading, HStack, Stack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";

export default function PgLayout() {
  return (
    <Flex flex="1" direction="column" h="full" bg="bg">
      <PgHeader />

      <Stack as="main" flex="1" alignItems="stretch">
        <Container mt={{ base: 3, md: 6 }} h="full" pb="gap.xl" px={{ base: "gap.sm", md: "6" }}>
          <Outlet />
        </Container>
      </Stack>
    </Flex>
  );
}

function PgHeader() {
  return (
    <Container py="3" borderBottomWidth="1px">
      <HStack justify="space-between">
        <NavLink to="/">
          <Heading size="md">Probably Good Jobs</Heading>
        </NavLink>
      </HStack>
    </Container>
  );
}
