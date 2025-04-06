import { Tooltip } from "@/components/ui/tooltip";
import { Box, Flex, For, HStack, Icon, Stack, Text } from "@chakra-ui/react";
// @ts-ignore
import type { SystemProperties } from "@chakra-ui/react/dist/types/styled-system/generated/system.gen";
import { FaRegStar } from "react-icons/fa6";
import { HiMiniChartBar } from "react-icons/hi2";
/**
 * Converts 100 base rating to a 5 boxes rating, where the last box is filled by %.
 * Eg
 * - rating = 60 → box 4/5 filled with 0% background
 * - rating = 65 → box 4/5 filled with 25% background
 */
export function RatingBars(props: {
  type: "rating" | "importance";
  rating: string | number | unknown;
  color: SystemProperties["color"];
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
    <Tooltip
      content={
        <Stack>
          <Text textTransform="capitalize">{`${props.type}: ${Math.round(rating0to100)}%`}</Text>
        </Stack>
      }
      showArrow
      positioning={{ placement: "bottom" }}
      openDelay={400}
      closeDelay={300}
    >
      <HStack align="center">
        <Icon color={props.color} boxSize={6}>
          {props.type === "importance" ? <HiMiniChartBar /> : <FaRegStar />}
        </Icon>

        <Flex h="fit-content">
          <HStack gap="0" mt="1px">
            <For each={[1, 2, 3, 4, 5]}>
              {boxNumber => (
                <Box
                  key={boxNumber}
                  w="8"
                  h="15px"
                  _first={{ borderLeftRadius: "md" }}
                  _last={{ borderRightRadius: "md" }}
                  _notFirst={{ ml: { base: "-1px", _dark: "-1px" } }}
                  //
                  // below mixes in `outline` w oklab to match <Box> background → eyes comfort+
                  // learnt from https://tailwindcss.com/docs/colors palette
                  backgroundGradient={`
                  linear-gradient(
                    to right,
                    {colors.bg.secondary.medium} 0%,
                    {colors.bg.secondary.medium} ${getBoxFillPercentage(boxNumber)}%,
                    {colors.bg.secondary.light} ${getBoxFillPercentage(boxNumber)}%,
                    {colors.bg.secondary.light} 100%
                  )`}
                  outline="1px solid"
                  outlineOffset={"calc(1px * -1)"}
                  outlineColor={{
                    base: "color-mix(in oklab, #000 7%, transparent)",
                    _dark: "color-mix(in oklab, #fff 14%, transparent)",
                  }}
                />
              )}
            </For>
          </HStack>
        </Flex>
      </HStack>
    </Tooltip>
  );
}
