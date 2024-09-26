import { Webhook } from "lucide-react";
import { Outlet } from "react-router";
import { Flex, VStack } from "styled-system/jsx";
import { UserCurrentBox } from "~/apps/users/UserCurrentBox.tsx";
import { Icon } from "~/components/ui/icon.tsx";
import { Text } from "~/components/ui/text";

export function RootLayout() {
	const padding = 6;

	return (
		<VStack h="100%" gap={0}>
			<Flex flex={1} w="100%" h="100%" align="flex-start">
				<VStack
					flex={0}
					alignItems="flex-start"
					justify="space-between"
					p={padding}
					w="100%"
					h="100%"
					borderRight="1px solid"
					borderColor="gray.5"
				>
					<Flex direction="column">
						<Flex
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
					</Flex>

					<UserCurrentBox />
				</VStack>

				<VStack flex={1} alignItems="flex-start" p={padding} w="100%">
					{<Outlet />}
				</VStack>
			</Flex>

			<Flex
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
					© 2024 NeuronHub
				</Text>
			</Flex>
		</VStack>
	);
}
