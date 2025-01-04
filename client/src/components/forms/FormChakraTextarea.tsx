import { Textarea } from "@chakra-ui/react";
import { Field as ChakraField } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export function FormChakraTextarea<FormType>(
  props: {
    form: UseFormReturn<FormType>;
    formRegister: UseFormRegisterReturn;
    placeholder?: string;
    label?: ReactNode;
    helperText?: ReactNode;
    errorText?: ReactNode;
    optionalText?: ReactNode;
  } & Omit<ChakraField.RootProps, "label">,
) {
  const state = props.form.formState;
  const { formRegister, helperText, ...propsRoot } = props;

  return (
    <ChakraField.Root {...propsRoot}>
      {props.label && (
        <ChakraField.Label>
          {props.label}
          <ChakraField.RequiredIndicator fallback={props.optionalText} />
        </ChakraField.Label>
      )}

      <Textarea
        {...formRegister}
        autoresize
        onChange={event => formRegister.onChange(event)}
        placeholder={props.placeholder}
        aria-invalid={!!state.errors?.[formRegister.name]}
        _hover={{ borderColor: "gray.300" }}
      />

      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {state.errors?.[formRegister.name]?.message && (
        <ChakraField.ErrorText>
          {state.errors?.[formRegister.name]?.message}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
}
