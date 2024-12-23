import { Input } from "@chakra-ui/react";
import { Field as ChakraField } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export function NeuronChakraField<FormType>(
	props: {
		form: UseFormReturn<FormType>;
		formRegister: UseFormRegisterReturn;
		name: string;
		placeholder?: string;
		label?: ReactNode;
		helperText?: ReactNode;
		errorText?: ReactNode;
		optionalText?: ReactNode;
	} & Omit<ChakraField.RootProps, "label">,
) {
	const state = props.form.formState;
	const { formRegister, ...propsRoot } = props;

	return (
		<ChakraField.Root {...propsRoot}>
			{props.label && (
				<ChakraField.Label>
					{props.label}
					<ChakraField.RequiredIndicator fallback={props.optionalText} />
				</ChakraField.Label>
			)}
			<Input
				{...props.formRegister}
				placeholder={props.placeholder}
				_invalid={state.errors?.[props.name]}
			/>
			{props.helperText && (
				<ChakraField.HelperText>{props.helperText}</ChakraField.HelperText>
			)}
			{state.errors?.[props.name]?.message && (
				<ChakraField.ErrorText>
					{state.errors?.[props.name]?.message}
				</ChakraField.ErrorText>
			)}
		</ChakraField.Root>
	);
}
