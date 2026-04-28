import { Button, EmptyState, Icon, Link, Stack } from "@chakra-ui/react";
import { PiFileDashedThin } from "react-icons/pi";
import { NavLink } from "react-router";
import { urls } from "@/urls";

export default function Page404() {
  return (
    <EmptyState.Root size="lg" py="gap.xl" mt="gap.md">
      <EmptyState.Content>
        <EmptyState.Indicator>
          <Icon color="primary/40">
            <PiFileDashedThin />
          </Icon>
        </EmptyState.Indicator>
        <Stack textAlign="center" gap="2">
          <EmptyState.Title>404 - Page not found</EmptyState.Title>
          <EmptyState.Description>
            The page you’re looking for doesn’t exist or was moved.
          </EmptyState.Description>
        </Stack>

        <Button asChild variant="subtle" _hover={{ textDecoration: 0 }}>
          <Link asChild>
            <NavLink to={urls.home}>Go home</NavLink>
          </Link>
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
