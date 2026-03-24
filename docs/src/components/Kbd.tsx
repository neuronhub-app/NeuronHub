import { Kbd as ChakraKbd } from "@chakra-ui/react";

export function Kbd(props: { keys: string }) {
  return (
    <ChakraKbd display="inline-flex" gap="1" alignItems="center" borderRadius="sm">
      {props.keys
        .split(" ")
        .flatMap((key, index) =>
          index > 0
            ? [<span key={`${key}-separator`}>+</span>, <span key={key}>{key}</span>]
            : [<span key={key}>{key}</span>],
        )}
    </ChakraKbd>
  );
}
