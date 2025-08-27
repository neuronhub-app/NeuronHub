import { Field, Input, InputGroup } from "@chakra-ui/react";
import type { ComponentProps, ReactElement } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";

import { ids } from "@/e2e/ids";

// #AI
export function FormChakraInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  onKeyEnter,
  placeholder,
  inputProps,
  startElement,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    placeholder?: string;
    onKeyEnter?: () => void;
    inputProps?: ComponentProps<typeof Input> & { "data-testid"?: string };
    startElement?: ReactElement;
  }) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    control,
    name,
  });

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      {label && <Field.Label>{label}</Field.Label>}
      <InputGroup w="full" startElement={startElement}>
        <Input
          {...field}
          {...inputProps}
          value={field.value ?? ""}
          onKeyDown={event => {
            if (event.key === "Enter") {
              onKeyEnter?.();
            }
          }}
        />
      </InputGroup>
      <Field.ErrorText {...ids.set(ids.form.input.error)}>
        {fieldState.error?.message}
      </Field.ErrorText>
    </Field.Root>
  );
}
