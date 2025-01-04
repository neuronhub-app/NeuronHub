import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { ReactNode } from "react";
import {
  Controller,
  type UseFormRegisterReturn,
  type UseFormReturn,
} from "react-hook-form";

export function FormChakraSegmentControl<FormType>(props: {
  form: UseFormReturn<FormType>;
  formRegister: UseFormRegisterReturn;
  label: string;
  items: Array<{
    value: string;
    label: ReactNode;
  }>;
}) {
  const errors = props.form.formState.errors?.[props.formRegister.name];

  return (
    <Controller
      control={props.form.control}
      name={props.formRegister.name}
      render={({ field }) => (
        <Field
          label={props.label}
          invalid={!!errors}
          errorText={errors?.message}
        >
          <SegmentedControl
            onBlur={field.onBlur}
            name={field.name}
            value={field.value}
            items={props.items}
            onValueChange={change => field.onChange(change.value)}
          />
        </Field>
      )}
    />
  );
}
