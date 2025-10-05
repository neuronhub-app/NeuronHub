import { Field, HStack, Icon, SegmentGroup, Text } from "@chakra-ui/react";
import type { ComponentProps, JSX } from "react";
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
  "data-testid": dataTestId,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    items: Array<{ value: string; icon: JSX.Element; label?: string }>;
    segmentGroupProps?: Omit<
      ComponentProps<typeof SegmentGroup.Root>,
      "name" | "value" | "onValueChange" | "onBlur"
    >;
    "data-testid"?: string;
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
        onValueChange={event => field.onChange(event.value)}
        data-testid={dataTestId}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={items.map(item => ({
            value: item.value,
            label: (
              <HStack
                data-testid={`${dataTestId}.${item.value}`}
                data-state={field.value === item.value ? "checked" : "unchecked"}
              >
                <Icon>{item.icon}</Icon>
                {item.label ? (
                  <Text>{item.label}</Text>
                ) : (
                  <Text textTransform="capitalize">{item.value.toLowerCase()}</Text>
                )}
              </HStack>
            ),
          }))}
        />
      </SegmentGroup.Root>
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
