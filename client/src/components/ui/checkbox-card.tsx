/**
 * Changes:
 * - added _hover
 * - made `icon` and `label` required
 * - Content.gap={3}
 * - Description.mt="-1.5"
 */
import { CheckboxCard as ChakraCheckboxCard } from "@chakra-ui/react";
import * as React from "react";

export interface CheckboxCardProps extends ChakraCheckboxCard.RootProps {
  icon: React.ReactElement;
  label: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  indicator?: React.ReactNode | null;
  indicatorPlacement?: "start" | "end" | "inside";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const CheckboxCard = React.forwardRef<
  HTMLInputElement,
  CheckboxCardProps
>(function CheckboxCard(props, ref) {
  const {
    inputProps,
    label,
    description,
    icon,
    addon,
    indicator = <ChakraCheckboxCard.Indicator />,
    indicatorPlacement = "end",
    ...rest
  } = props;

  const hasContent = label || description || icon;

  return (
    <ChakraCheckboxCard.Root {...rest} _hover={{ bg: "gray.50" }}>
      <ChakraCheckboxCard.HiddenInput ref={ref} {...inputProps} />
      <ChakraCheckboxCard.Control>
        {indicatorPlacement === "start" && indicator}
        {hasContent && (
          <ChakraCheckboxCard.Content gap={3}>
            {icon}
            <ChakraCheckboxCard.Label>{label}</ChakraCheckboxCard.Label>
            <ChakraCheckboxCard.Description fontSize="xs" mt="-1.5">
              {description}
            </ChakraCheckboxCard.Description>
            {indicatorPlacement === "inside" && indicator}
          </ChakraCheckboxCard.Content>
        )}
        {indicatorPlacement === "end" && indicator}
      </ChakraCheckboxCard.Control>
      {addon && <ChakraCheckboxCard.Addon>{addon}</ChakraCheckboxCard.Addon>}
    </ChakraCheckboxCard.Root>
  );
});

export const CheckboxCardIndicator = ChakraCheckboxCard.Indicator;
