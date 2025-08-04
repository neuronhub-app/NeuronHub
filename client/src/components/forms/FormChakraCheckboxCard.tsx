import { CheckboxCard, CheckboxCardIndicator, Float, Icon } from "@chakra-ui/react";
import type { ComponentProps, ReactElement } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";

export function FormChakraCheckboxCard<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  icon,
  indicator,
  checkboxCardProps,
}: UseControllerProps<TFieldValues, TName> & {
  label: string;
  icon: ReactElement;
  description?: string;
  indicator?: ReactElement;
  checkboxCardProps?: Omit<ComponentProps<typeof CheckboxCard.Root>, "children">;
}) {
  const { field } = useController<TFieldValues, TName>({ control, name });

  return (
    <CheckboxCard.Root
      {...checkboxCardProps}
      _hover={{ bg: "bg.light", _dark: { bg: "bg.light" }, cursor: "pointer" }}
    >
      <CheckboxCard.HiddenInput
        {...field}
        checked={field.value}
        onChange={e => field.onChange(e.currentTarget.checked)}
      />
      <CheckboxCard.Control>
        <CheckboxCard.Content gap={3}>
          <Icon fontSize="2xl">{icon}</Icon>
          <CheckboxCard.Label>{label}</CheckboxCard.Label>
          {description && (
            <CheckboxCard.Description fontSize="xs" mt="-1.5">
              {description}
            </CheckboxCard.Description>
          )}
        </CheckboxCard.Content>
        <Float placement="top-end" offset="6">
          {indicator || (
            <Float placement="top-end" offset="6">
              <CheckboxCardIndicator />
            </Float>
          )}
        </Float>
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}
