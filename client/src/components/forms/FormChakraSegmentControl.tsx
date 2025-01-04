import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { ReactNode } from "react";
import {
  Controller,
  type Path,
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
      // react-hook-form types aren't good enough to accept a generic or detect it
      name={props.formRegister.name as Path<FormType>}
      render={({ field }) => (
        <Field
          label={props.label}
          invalid={!!errors}
          errorText={errors?.message}
        >
          <SegmentedControl
            onBlur={field.onBlur}
            name={field.name}
            value={field.value as Path<FormType>}
            items={props.items}
            onValueChange={change => field.onChange(change.value)}
          />
        </Field>
      )}
    />
  );
}