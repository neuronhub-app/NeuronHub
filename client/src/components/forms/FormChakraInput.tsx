import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { Group, IconButton, Input } from "@chakra-ui/react";
import type { Field as ChakraField } from "@chakra-ui/react";
import { formatISO } from "date-fns";
import { CheckIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export function FormChakraInput<FormType>(
  props: {
    form: UseFormReturn<FormType>;
    formRegister: UseFormRegisterReturn;
    placeholder?: string;
    label?: ReactNode;
    helperText?: ReactNode;
    errorText?: ReactNode;
    optionalText?: ReactNode;
    type?: "date";

    startElement?: ReactNode;

    // React triggers re-render on react-hook-form changes, which drops DOM elements that depend on Chakra state,
    // hence changes need batching if the Field eg within a Chakra's Popover
    isBatchStateChanges?: boolean;
  } & Omit<ChakraField.RootProps, "label">,
) {
  const state = props.form.formState;

  // extract props not for <Input>
  const {
    formRegister,
    isBatchStateChanges,
    type,
    startElement,
    ...propsRoot
  } = props;

  const [value, setValue] = useState<string>(
    state.dirtyFields[formRegister.name],
  );

  return (
    <Field
      {...propsRoot}
      invalid={Boolean(state.errors?.[formRegister.name])}
      errorText={state.errors?.[formRegister.name]?.message}
    >
      <Group attached={isBatchStateChanges} w="100%">
        <InputGroup w="full" startElement={startElement}>
          <Input
            {...formRegister}
            defaultValue={
              type === "date"
                ? formatISO(new Date(), { representation: "date" })
                : state.dirtyFields[formRegister.name]
            }
            type={type}
            onChange={async event => {
              setValue(event.target.value);

              if (!isBatchStateChanges) {
                await formRegister.onChange(event);
              }
            }}
            onKeyDown={async event => {
              if (event.key === "Enter") {
                await formRegister.onChange(event);
              }
            }}
            onBlur={async event => {
              if (isBatchStateChanges) {
                await formRegister.onChange(event);
              }
            }}
            placeholder={props.placeholder}
            _hover={{
              borderColor: "gray.300",
              _dark: { borderColor: "gray.700" },
            }}
          />
        </InputGroup>

        {isBatchStateChanges && (
          <IconButton
            p={0}
            variant="subtle"
            color="gray"
            type="button"
            onClick={() => formRegister.onChange({ target: { value: value } })}
          >
            <CheckIcon size={10} />
          </IconButton>
        )}
      </Group>
    </Field>
  );
}
