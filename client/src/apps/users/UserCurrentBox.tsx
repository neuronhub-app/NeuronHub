import { Flex } from "styled-system/jsx";
import { useUserCurrent } from "~/apps/users/useUserCurrent.tsx";
import { Avatar } from "~/components/ui/avatar.tsx";
import { Skeleton } from "~/components/ui/skeleton.tsx";
import { Text } from "~/components/ui/text";

export function UserCurrentBox() {
	const userQuery = useUserCurrent();

	return userQuery.fetching ? (
		<Flex align="center" gap={3} w="100%">
			<Skeleton minW="40px" h="40px" borderRadius="100%" />
			<Skeleton w="100%" h="20px" />
		</Flex>
	) : (
		<Flex align="center" gap={3}>
			<Avatar name={userQuery?.user?.first_name} />
			<Text>{userQuery?.user?.first_name}</Text>
		</Flex>
	);
}
