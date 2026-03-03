import { Container, Flex, Heading, HStack, Stack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";

export default function PgLayout() {
  return (
    <Flex flex="1" direction="column" h="full">
      <PgHeader />

      <Stack as="main" flex="1" alignItems="stretch">
        <Container mt={6} h="full" pb="gap.xl">
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
