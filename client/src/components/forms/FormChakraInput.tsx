import { Input } from "@chakra-ui/react";
import { type ReactNode, useEffect, useRef } from "react";
import { type FieldValues, type UseControllerProps, useController } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";

export function FormChakraInput<TFieldValues extends FieldValues>(props: {
  field: UseControllerProps<TFieldValues>;

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
}) {
  const { field, fieldState } = useController(props.field);

  const inputRef = useRef(null as HTMLInputElement | null);

  useEffect(() => {
    setTimeout(() => {
      if (props.autoFocus) {
        inputRef.current?.focus();
      }
    }, 0);
  }, []);

  return (
    <Field
      label={props.label}
      invalid={!!fieldState.error}
      errorText={fieldState.error?.message}
      maxW={props.maxW}
    >
      <InputGroup w="full" startElement={props.startElement}>
        <Input
          {...field}
          ref={e => {
            field.ref(e);
            inputRef.current = e; // you can still assign to ref
          }}
          _hover={{
            borderColor: "gray.300",
            _dark: { borderColor: "gray.700" },
          }}
          type={props.inputProps?.type}
          size={props.inputProps?.size}
          onKeyDown={event => {
            if (event.key === "Enter" && props.onKeyEnter) {
              props.onKeyEnter();
            }
          }}
        />
      </InputGroup>
    </Field>
  );
}
