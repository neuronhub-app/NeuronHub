import { Checkbox } from "@chakra-ui/react";
import { Field as ChakraField } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export function FormChakraCheckboxField<FormType>(
  props: {
    form: UseFormReturn<FormType>;
    formRegister: UseFormRegisterReturn;
    label?: ReactNode;
    helperText?: ReactNode;
    errorText?: ReactNode;
    optionalText?: ReactNode;
  } & Omit<ChakraField.RootProps, "label">,
) {
  const state = props.form.formState;
  const { formRegister, ...propsRoot } = props;

  return (
    <ChakraField.Root {...propsRoot}>
      <Checkbox.Root>
        <Checkbox.HiddenInput
          {...formRegister}
          onChange={event => formRegister.onChange(event)}
          aria-invalid={state.errors?.[formRegister.name]}
        />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        {props.label && (
          <Checkbox.Label>
            {props.label}
            <ChakraField.RequiredIndicator fallback={props.optionalText} />
          </Checkbox.Label>
        )}
      </Checkbox.Root>

      {props.helperText && (
        <ChakraField.HelperText>{props.helperText}</ChakraField.HelperText>
      )}
      {state.errors?.[formRegister.name]?.message && (
        <ChakraField.ErrorText>
          {state.errors?.[formRegister.name]?.message}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
}
