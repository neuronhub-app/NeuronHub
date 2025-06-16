import { Field as ChakraField, Checkbox } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { ReviewCreateForm } from "@/apps/reviews/create";

export function FormChakraCheckboxField(
  props: {
    form: UseFormReturn<ReviewCreateForm.FormSchema>;
    formRegister: UseFormRegisterReturn<"rating">;
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

      {props.helperText && <ChakraField.HelperText>{props.helperText}</ChakraField.HelperText>}
      {state.errors?.[formRegister.name]?.message && (
        <ChakraField.ErrorText>
          {state.errors?.[formRegister.name]?.message}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
}
