import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";
import { type UseControllerProps, useController } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";

export function FormChakraSegmentControl<TFieldValues extends FieldValues>(props: {
  field: UseControllerProps<TFieldValues>;
  label: string;
  items: Array<{
    value: string;
    label: ReactNode;
  }>;
  size?: "sm" | "md" | "lg";
}) {
  const { field, fieldState } = useController(props.field);

  return (
    <Field
      label={props.label}
      invalid={!!fieldState.error}
      errorText={fieldState.error?.message}
    >
      <SegmentedControl
        onBlur={field.onBlur}
        name={field.name}
        value={field.value as any}
        items={props.items}
        onValueChange={change => field.onChange(change.value)}
        size={props.size}
      />
    </Field>
  );
}
