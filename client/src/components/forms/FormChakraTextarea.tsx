import { Field as ChakraField, Flex, Float, Icon, Textarea } from "@chakra-ui/react";
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
  fieldProps?: Omit<ChakraField.RootProps, "label">;
  "data-testid"?: string;
}) {
  const { field, fieldState } = useController(props.field);

  return (
    <ChakraField.Root {...props.fieldProps}>
      {props.label && (
        <ChakraField.Label>
          {props.label}
          <ChakraField.RequiredIndicator fallback={props.optionalText} />
        </ChakraField.Label>
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

      {props.helperText && <ChakraField.HelperText>{props.helperText}</ChakraField.HelperText>}
      {fieldState.error?.message && (
        <ChakraField.ErrorText>{fieldState.error?.message}</ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
}
