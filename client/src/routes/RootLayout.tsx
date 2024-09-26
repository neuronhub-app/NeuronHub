import { Outlet } from "react-router";
import { Flex, Spacer, VStack } from "styled-system/jsx";
import { Heading } from "~/components/ui/heading.tsx";

export function RootLayout() {
	const padding = 10;
	return (
		<Flex w="100%" h="100%" align="flex-start">
			<VStack flex={0} alignItems="flex-start" p={padding} w="100%">
				<Heading>NeuronHub</Heading>
			</VStack>

			<Spacer flex="px" w="1px" h="100%" bg="gray.5" />

			<VStack flex={1} alignItems="flex-start" p={padding} w="100%">
				{<Outlet />}
			</VStack>
		</Flex>
	);
}
