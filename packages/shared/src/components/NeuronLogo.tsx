import { Badge, Bleed, type BleedProps, Icon, Text } from "@chakra-ui/react";
import { PiGraph } from "react-icons/pi";

export function NeuronLogo(props: { breakpoint: "xl" | "2xl"; chakra?: BleedProps }) {
  return (
    <Bleed
      display="flex"
      gap="gap.sm"
      block="gap.sm"
      inline="gap.sm"
      p={{ base: "1px", [props.breakpoint]: "gap.sm" }}
      _hover={{
        bgColor: "colorPalette.subtle",
      }}
      borderRadius="sm"
      {...props.chakra}
    >
      <Icon color="primary" size="xl">
        <PiGraph />
      </Icon>
      <Text fontSize="1.4rem" fontWeight="bold">
        NeuronHub
      </Text>
      <Badge h="fit-content" size="xs" textTransform="uppercase">
        Alpha
      </Badge>
    </Bleed>
  );
}
