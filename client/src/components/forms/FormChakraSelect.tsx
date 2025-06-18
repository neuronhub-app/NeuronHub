import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { ReviewCreateForm } from "@/apps/reviews/create";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";

export function FormChakraSelect(props: {
  form: UseFormReturn<ReviewCreateForm.FormSchema>;
  formRegister: UseFormRegisterReturn;
  label: string;
  placeholder?: string;
  fieldName: "review_importance";
  options: Array<{
    label: string;
    value: ReviewCreateForm.FormSchema["review_importance"];
  }>;
}) {
  return (
    <Field
      label={props.label}
      invalid={!!props.form.formState.errors[props.fieldName]}
      errorText={props.form.formState.errors[props.fieldName]?.message}
    >
      <NativeSelectRoot width="240px">
        <NativeSelectField {...props.formRegister}>
          {props.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
    </Field>
  );
}
