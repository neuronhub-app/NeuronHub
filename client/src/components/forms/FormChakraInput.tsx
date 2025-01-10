import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { Group } from "@chakra-ui/react";
import { Input as ChakraInput } from "@chakra-ui/react";
import { formatISO } from "date-fns";
import { type ReactNode, useEffect, useRef } from "react";
import type {
  UseFormRegisterReturn,
  UseFormReturn,
  useForm,
} from "react-hook-form";

export interface FormChakraInputProps<
  FormType extends ReturnType<typeof useForm>,
> {
  form: UseFormReturn<FormType>;
  formRegister: UseFormRegisterReturn;
  placeholder?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  optionalText?: ReactNode;
  autoFocus?: boolean;

  onKeyEnter?: () => void;

  inputProps?: {
    type?: "date";
    size?: "xs" | "sm" | "md" | "lg";
  };

  startElement?: ReactNode;

  maxW?: string;
}

export function FormChakraInput(props: FormChakraInputProps<any>) {
  const state = props.form.formState;

  // extract props not for <Input>
  const { inputProps, startElement, onKeyEnter, formRegister, ...propsRoot } =
    props;

  const inputRef = useRef(null as HTMLInputElement | null);

  const { ref, ...formRegisterRest } = formRegister;

  useEffect(() => {
    setTimeout(() => {
      if (props.autoFocus) {
        inputRef.current?.focus();
      }
    }, 0);
  }, []);

  return (
    <Field
      {...propsRoot}
      invalid={Boolean(state.errors?.[formRegister.name])}
      errorText={state.errors?.[formRegister.name]?.message as string} // @bad-inference
      maxW={props.maxW}
    >
      <Group attached={false} w="100%">
        <InputGroup w="full" startElement={startElement}>
          <ChakraInput
            {...formRegisterRest}
            ref={e => {
              ref(e);
              inputRef.current = e; // you can still assign to ref
            }}
            onKeyDown={event => {
              if (event.key === "Enter" && props.onKeyEnter) {
                props.onKeyEnter();
              }
            }}
            defaultValue={
              inputProps?.type === "date"
                ? formatISO(new Date(), { representation: "date" })
                : state.dirtyFields[formRegister.name]
            }
            type={inputProps?.type}
            size={inputProps?.size}
            placeholder={props.placeholder}
            _hover={{
              borderColor: "gray.300",
              _dark: { borderColor: "gray.700" },
            }}
          />
        </InputGroup>
      </Group>
    </Field>
  );
}
