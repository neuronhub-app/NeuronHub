import { Box, Flex, For, HStack, Icon, type JsxStyleProps, Stack, Text } from "@chakra-ui/react";
import { FaStar, FaUserClock } from "react-icons/fa6";
import { GoAlertFill } from "react-icons/go";
import { Tooltip } from "@/components/ui/tooltip";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

type RatingType = "rating" | "importance" | "experience";

/**
 * Converts 100 base rating to a 5 boxes rating, where the last box is filled by %.
 * Eg
 * - rating = 60 → box 4/5 filled with 0% background
 * - rating = 65 → box 4/5 filled with 25% background
 */
export function RatingBars(props: {
  type: RatingType;
  rating: string | number | unknown;
  color: JsxStyleProps["color"];
  boxSize?: JsxStyleProps["boxSize"];
}) {
  if (!props.rating) {
    return null;
  }

  const rating0to100 = Number(props.rating);

  function getBoxFillPercentage(boxNumber: 1 | 2 | 3 | 4 | 5): number {
    const rating0to5 =
      props.type === "experience" ? getExperienceRating0to5(rating0to100) : rating0to100 / 20;

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

  let icon = <FaStar />;
  if (props.type === "importance") {
    icon = <GoAlertFill />;
  }
  if (props.type === "experience") {
    icon = <FaUserClock />;
  }

  return (
    <Tooltip
      content={
        <Stack>
          <Text textTransform="capitalize">{getTooltipContent(props.type, rating0to100)}</Text>
        </Stack>
      }
      showArrow
      positioning={{ placement: "bottom" }}
      openDelay={400}
      closeDelay={300}
    >
      <HStack align="center">
        <Icon color={props.color} boxSize={props.boxSize ?? 5}>
          {icon}
        </Icon>

        <Flex h="fit-content">
          <HStack gap="0" mt="1px">
            <For each={[1, 2, 3, 4, 5]}>
              {boxNumber => (
                <Box
                  key={boxNumber}
                  w="6"
                  h="15px"
                  _first={{ borderLeftRadius: "md" }}
                  _last={{ borderRightRadius: "md" }}
                  _notFirst={{ ml: { base: "-1px", _dark: "-1px" } }}
                  backgroundGradient={`
                    linear-gradient(
                      to right,
                      {colors.bg.secondary.medium} 0%,
                      {colors.bg.secondary.medium} ${getBoxFillPercentage(boxNumber)}%,
                      {colors.bg.secondary.light} ${getBoxFillPercentage(boxNumber)}%,
                      {colors.bg.secondary.light} 100%
                    )
                  `}
                  {...getOutlineBleedingProps()}
                />
              )}
            </For>
          </HStack>
        </Flex>
      </HStack>
    </Tooltip>
  );
}

function getTooltipContent(type: RatingType, rating: number): string {
  const contentStart = `${type}:`;
  let contentEnd = "";
  if (type === "rating") {
    contentEnd = `${Math.round(rating)}%`;
  }
  if (type === "importance") {
    contentEnd = `${Math.round(rating)}%`;
  }
  if (type === "experience") {
    // renders hours with a `'` for readability
    contentEnd = `${Math.round(rating).toLocaleString("en-US", { useGrouping: true })}h`;
  }
  return `${contentStart} ${contentEnd}`;
}

function getExperienceRating0to5(hours: number): number {
  // 1. 0-40h
  // 2. 100h
  // 3. 350 (4h over few months)
  // 4. 700 (4h over half a year)
  // 5. 1'500h (4h over 1+ years)
  // 6. 3'000h (4h over 2+ years)
  // 7. 7'000h+ (4h over 5+ years)
  // 8. 14'000h+ (4h over 10+ years)
  // 9. 28'000h+ (4h over 20+ years)
  if (hours <= 40) {
    return 0.5;
  }
  if (hours <= 100) {
    return 1;
  }
  if (hours <= 350) {
    return 1.5;
  }
  if (hours <= 700) {
    return 2;
  }
  if (hours <= 1_500) {
    return 2.5;
  }
  if (hours <= 3_000) {
    return 3;
  }
  if (hours <= 7_000) {
    return 3.5;
  }
  if (hours <= 14_000) {
    return 4;
  }
  return 4.5;
}
