import { Field, Flex, Float, Icon, Textarea } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { type FieldValues, type UseControllerProps, useController } from "react-hook-form";
import { FaMarkdown } from "react-icons/fa";
import { Tooltip } from "@/components/ui/tooltip";

export function FormChakraTextarea<TFieldValues extends FieldValues>(props: {
  field: UseControllerProps<TFieldValues>;
  placeholder?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  optionalText?: ReactNode;
  isShowIconMarkdown?: boolean;
  fieldProps?: Omit<Field.RootProps, "label">;
  "data-testid"?: string;
}) {
  const { field, fieldState } = useController(props.field);

  return (
    <Field.Root {...props.fieldProps} invalid={!!fieldState.error}>
      {props.label && (
        <Field.Label>
          {props.label}
          <Field.RequiredIndicator fallback={props.optionalText} />
        </Field.Label>
      )}

      <Flex w="full">
        <Textarea
          {...field}
          autoresize
          placeholder={props.placeholder}
          aria-invalid={!!fieldState.error}
          data-testid={props["data-testid"]}
          _hover={{
            borderColor: "gray.300",
            _dark: { borderColor: "gray.700" },
          }}
        />
        {props.isShowIconMarkdown && (
          <Float offset="6" placement="bottom-end">
            <Tooltip
              content="Markdown supported"
              openDelay={400}
              closeDelay={100}
              showArrow
              closeOnClick={false}
            >
              <Icon
                opacity={0.25}
                _hover={{ opacity: 0.5, cursor: "context-menu" }}
                fontSize="19px"
              >
                <FaMarkdown />
              </Icon>
            </Tooltip>
          </Float>
        )}
      </Flex>

      {props.helperText && <Field.HelperText>{props.helperText}</Field.HelperText>}

      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
