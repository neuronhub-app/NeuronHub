import type { ReviewCreateForm } from "@/apps/reviews/ReviewCreateForm";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

export function FormChakraSlider(props: {
  form: UseFormReturn<ReviewCreateForm.FormSchema>;
  formRegister: UseFormRegisterReturn<"rating">;
  control: any;
  label?: ReactNode;
  maxW?: string;
  hidden?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const state = props.form.formState;

  return (
    <Controller
      name={props.formRegister.name}
      control={props.control}
      render={({ field }) => (
        <Field
          invalid={!!state.errors?.[props.formRegister.name]}
          errorText={state.errors?.[props.formRegister.name]?.message}
          hidden={props.hidden}
        >
          <Slider
            width="full"
            size={props.size}
            maxW={props.maxW}
            onFocusChange={({ focusedIndex }) => {
              if (focusedIndex !== -1) {
                return;
              }
              field.onBlur();
            }}
            name={field.name}
            value={[field.value]}
            onValueChange={({ value }) => {
              field.onChange(value[0]);
            }}
            label={props.label}
          />
        </Field>
      )}
    />
  );
}
