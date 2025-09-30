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
  helpText,
  inputProps,
  startElement,
  isUrlPrefix,
  ...fieldRootProps
}: UseControllerProps<TFieldValues, TName> &
  Omit<ComponentProps<typeof Field.Root>, "children"> & {
    label?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    isUrlPrefix?: boolean;
    onKeyEnter?: () => void;
    inputProps?: ComponentProps<typeof Input> & { "data-testid"?: string };
    startElement?: ReactElement | string;
  }) {
  const { field, fieldState } = useController<TFieldValues, TName>({
    control,
    name,
  });

  let startElementProps = {};
  if (isUrlPrefix) {
    startElement = "https://";
    startElementProps = { color: "fg.muted" };
  }

  return (
    <Field.Root invalid={!!fieldState.error} {...fieldRootProps}>
      {label && <Field.Label>{label}</Field.Label>}
      <InputGroup w="full" startElement={startElement} startElementProps={startElementProps}>
        <Input
          {...field}
          placeholder={placeholder}
          ps={isUrlPrefix ? "7ch" : undefined} // padding for "https://"
          {...inputProps}
          value={field.value ?? ""}
          onKeyDown={event => {
            if (event.key === "Enter") {
              onKeyEnter?.();
            }
          }}
        />
      </InputGroup>
      {helpText && <Field.HelperText color="fg.subtle">{helpText}</Field.HelperText>}
      <Field.ErrorText {...ids.set(ids.form.input.error)}>
        {fieldState.error?.message}
      </Field.ErrorText>
    </Field.Root>
  );
}
