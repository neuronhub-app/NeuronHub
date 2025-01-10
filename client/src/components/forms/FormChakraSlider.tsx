import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import type { ReactNode } from "react";
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";

export function FormChakraSlider<TFieldValues extends FieldValues>(props: {
  field: UseControllerProps<TFieldValues>;
  label?: ReactNode;
  maxW?: string;
  hidden?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const { field, fieldState } = useController(props.field);

  return (
    <Field
      invalid={!!fieldState.error}
      errorText={fieldState.error?.message}
      hidden={props.hidden}
    >
      <Slider
        width="full"
        size={props.size}
        maxW={props.maxW}
        onFocusChange={({ focusedIndex }) => {
          if (focusedIndex !== -1) {
            return;
          }
          field.onBlur();
        }}
        name={field.name}
        value={[field.value]}
        onValueChange={({ value }) => {
          field.onChange(value[0]);
        }}
        label={props.label}
      />
    </Field>
  );
}
