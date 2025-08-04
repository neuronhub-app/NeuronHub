import { Field } from "@chakra-ui/react";
import type { ComponentProps, ReactElement } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";

/**
 * Base for any Chakra + react-hook-form field.
 * #AI
 */
export function ChakraFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  rules,
  label,
  helperText,
  children,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: ReactElement | string;
    helperText?: ReactElement | string;
    children: (
      field: ReturnType<typeof useController<TFieldValues, TName>>["field"],
    ) => ReactElement;
  }) {
  const { field, fieldState } = useController({ control, name, rules });

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      {label && <Field.Label>{label}</Field.Label>}
      {children(field)}
      {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
