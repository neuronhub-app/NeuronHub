import { CheckboxCardIndicator, Float, Icon } from "@chakra-ui/react";
import type { ReactElement, ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { CheckboxCard } from "@/components/ui/checkbox-card";

export function FormChakraCheckboxCard(props: {
  form: UseFormReturn<ReviewCreateForm.FormSchema>;
  formRegister: UseFormRegisterReturn;
  label?: ReactNode;
  helperText?: ReactNode;

  icon: ReactElement;
  minW?: string;
}) {
  return (
    <CheckboxCard
      inputProps={props.formRegister}
      align="start"
      icon={<Icon fontSize="2xl">{props.icon}</Icon>}
      label={props.label}
      description={props.helperText}
      minW={props.minW}
      indicator={
        <Float placement="top-end" offset="6">
          <CheckboxCardIndicator />
        </Float>
      }
    />
  );
}
