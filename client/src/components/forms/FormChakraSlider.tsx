import { Box, Field, Slider, VStack } from "@chakra-ui/react";
import type { ComponentProps } from "react";
import type { FieldPath } from "react-hook-form";
import { type FieldValues, type UseControllerProps, useController } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";

const stageColors = [
  { token: "purple", intensity: "600" },
  { token: "blue", intensity: "500" },
  { token: "slate", intensity: "500" },
  { token: "teal", intensity: "500" },
  { token: "green", intensity: "600" },
] as const;

// #AI
export function FormChakraSlider<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  stages,
  breakpoints = [20, 40, 60, 80] as const,
  sliderProps,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    stages: readonly [string, string, string, string, string];
    breakpoints?: readonly [number, number, number, number];
    sliderProps?: ComponentProps<typeof Slider.Root>;
  }) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    control,
    name,
  });
  const valueForSlider = [field.value ?? 0]; // Slider uses Array

  function getStageIndex(value: number): number {
    if (value <= breakpoints[0]) return 0;
    if (value <= breakpoints[1]) return 1;
    if (value <= breakpoints[2]) return 2;
    if (value <= breakpoints[3]) return 3;
    return 4;
  }

  // Get smooth color interpolation with special handling for midpoint
  function getSmoothStageColor(val: number): string {
    // Direct mapping for exact breakpoints
    if (val === 0) {
      return `{colors.${stageColors[0].token}.${stageColors[0].intensity}}`;
    }
    if (val === 100) {
      return `{colors.${stageColors[4].token}.${stageColors[4].intensity}}`;
    }

    // Continuous interpolation across the full range
    const normalizedValue = val / 100; // 0 to 1
    const scaledPosition = normalizedValue * (stageColors.length - 1); // 0 to 4
    const lowerIndex = Math.floor(scaledPosition);
    const upperIndex = Math.min(lowerIndex + 1, stageColors.length - 1);
    const localProgress = scaledPosition - lowerIndex;

    const lowerColor = stageColors[lowerIndex];
    const upperColor = stageColors[upperIndex];

    const lowerToken = `{colors.${lowerColor.token}.${lowerColor.intensity}}`;
    const upperToken = `{colors.${upperColor.token}.${upperColor.intensity}}`;

    // For midpoint (eg 50), ensure visible transition
    const mixPercent = Math.round(localProgress * 100);

    return `color-mix(in oklch, ${upperToken} ${mixPercent}%, ${lowerToken})`;
  }

  const stageIndex = getStageIndex(field.value ?? 0);
  const stageColor = getSmoothStageColor(field.value ?? 0);
  const isVisible = field.value !== null;

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      <Slider.Root
        w="full"
        {...sliderProps}
        name={field.name}
        value={valueForSlider}
        onValueChange={event => {
          const valueForForm = event.value[0];
          field.onChange(valueForForm);
        }}
        onFocusChange={details => {
          if (details.focusedIndex === -1) {
            field.onBlur();
          }
        }}
        thumbAlignment="contain"
      >
        <VStack align="flex-start" w="full" gap="gap.sm">
          <Checkbox
            defaultChecked={isVisible}
            inputProps={{
              onChange: _ => field.onChange(field.value ? null : 50),
            }}
          >
            {label}
            {isVisible && (
              <Tag ml="gap.sm" colorPalette={stageColors[stageIndex].token}>
                <Slider.ValueText />%
              </Tag>
            )}
          </Checkbox>
        </VStack>

        <Box hidden={!isVisible}>
          <Slider.Control>
            <Slider.Track
              bg="bg.muted"
              transitionDuration="moderate"
              transitionProperty="background, color"
            >
              <Slider.Range
                bg={stageColor}
                transitionDuration="moderate"
                transitionProperty="background, color"
              />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              borderColor={stageColor}
              transitionDuration="moderate"
              transitionProperty="background, color"
            >
              <Slider.DraggingIndicator
                top="6"
                rounded="md"
                px="gap.sm"
                py="gap.xs"
                bg={stageColor}
                whiteSpace="nowrap"
                fontSize="xs"
                transitionDuration="moderate"
                transitionProperty="background, color"
                color="white"
              >
                {stages[stageIndex]}
              </Slider.DraggingIndicator>
            </Slider.Thumb>
            <Slider.Marks marks={[...breakpoints]} />
          </Slider.Control>
        </Box>
      </Slider.Root>

      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
