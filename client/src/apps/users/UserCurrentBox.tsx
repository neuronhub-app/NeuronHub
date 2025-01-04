import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { Avatar } from "@/components/ui/avatar";
import { Flex } from "@chakra-ui/react";
import { Skeleton } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";

export function UserCurrentBox() {
  const userQuery = useUserCurrent();

  return (
    <ErrorBoundary>
      {userQuery.fetching ? (
        <Flex align="center" gap={3} w="100%">
          <Skeleton minW="40px" h="40px" borderRadius="100%" />
          <Skeleton w="100%" h="20px" />
        </Flex>
      ) : (
        <Flex align="center" gap={3}>
          <Avatar name={userQuery?.user?.first_name} />
          <Text>{userQuery?.user?.first_name}</Text>
        </Flex>
      )}
    </ErrorBoundary>
  );
}
