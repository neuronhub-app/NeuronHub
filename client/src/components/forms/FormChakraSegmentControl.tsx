import { Field, SegmentGroup } from "@chakra-ui/react";
import type React from "react";
import type { ComponentProps } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { type UseControllerProps, useController } from "react-hook-form";

export function FormChakraSegmentControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  items,
  segmentGroupProps,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    items: Array<string | { value: string; label: React.ReactNode; disabled?: boolean }>;
    segmentGroupProps?: Omit<
      ComponentProps<typeof SegmentGroup.Root>,
      "name" | "value" | "onValueChange" | "onBlur"
    >;
  }) {
  const { field, fieldState } = useController<TFieldValues, TName>({ control, name });

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      {label && <Field.Label>{label}</Field.Label>}
      <SegmentGroup.Root
        {...segmentGroupProps}
        onBlur={field.onBlur}
        name={field.name}
        value={field.value}
        onValueChange={({ value }) => field.onChange(value)}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={items} />
      </SegmentGroup.Root>
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
