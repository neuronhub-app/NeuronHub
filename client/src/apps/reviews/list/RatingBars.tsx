import { Tooltip } from "@/components/ui/tooltip";
import { Box, For, HStack, Text } from "@chakra-ui/react";

/**
 * Converts 100 base rating to a 5 boxes rating, where the last box is filled by %.
 * Eg
 * - rating = 60 → box 4/5 filled with 0% background
 * - rating = 65 → box 4/5 filled with 25% background
 */
export function RatingBars(props: {
  title: string;
  rating: string | number | unknown;
}) {
  if (!props.rating) {
    return null;
  }

  const rating0to100 = Number(props.rating);

  function getBoxFillPercentage(boxNumber: 1 | 2 | 3 | 4 | 5): number {
    const rating0to5 = rating0to100 / 20;

    if (boxNumber <= rating0to5) {
      return 100;
    }

    const boxNumberPrev = boxNumber - 1;
    const fillPercent0to1 = rating0to5 - boxNumberPrev;
    if (fillPercent0to1 <= 0) {
      return 0;
    }
    return fillPercent0to1 * 100;
  }

  return (
    <HStack>
      <Text fontSize="sm">{props.title}</Text>
      <Tooltip
        content={`${Math.round(rating0to100)}%`}
        showArrow
        positioning={{ placement: "bottom" }}
        openDelay={400}
        closeDelay={300}
      >
        <HStack gap="3px">
          <For each={[1, 2, 3, 4, 5]}>
            {boxNumber => (
              <Box
                key={boxNumber}
                position="relative"
                w={5}
                h={4}
                borderRadius="sm"
                bg="bg.medium"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  bottom={0}
                  width={`${getBoxFillPercentage(boxNumber)}%`}
                  bg="bg.solid"
                />
              </Box>
            )}
          </For>
        </HStack>
      </Tooltip>
    </HStack>
  );
}
