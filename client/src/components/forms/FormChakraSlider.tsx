import { Field, Slider } from "@chakra-ui/react";
import type React from "react";
import type { ComponentProps } from "react";
import type { FieldPath } from "react-hook-form";
import { type FieldValues, type UseControllerProps, useController } from "react-hook-form";

// #AI
export function FormChakraSlider<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  sliderProps,
  marks,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    sliderProps?: ComponentProps<typeof Slider.Root>;
    marks?: Array<{ value: number; label: React.ReactNode }>;
  }) {
  const { field, fieldState } = useController<TFieldValues, TName>({ control, name });

  const valueForSlider = [field.value ?? 0]; // Slider uses Array

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      <Slider.Root
        w="full"
        {...sliderProps}
        name={field.name}
        value={valueForSlider}
        onValueChange={({ value }) => {
          const valueForForm = value[0];
          field.onChange(valueForForm);
        }}
        onFocusChange={({ focusedIndex }) => {
          if (focusedIndex === -1) {
            field.onBlur();
          }
        }}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0}>
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
        {marks && marks.length > 0 && <Slider.Marks marks={marks} />}
      </Slider.Root>
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
