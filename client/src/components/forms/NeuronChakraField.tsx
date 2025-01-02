import { Group, IconButton, Input } from "@chakra-ui/react";
import { Field as ChakraField } from "@chakra-ui/react";
import { CheckIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export function NeuronChakraField<FormType>(
	props: {
		form: UseFormReturn<FormType>;
		formRegister: UseFormRegisterReturn;
		placeholder?: string;
		label?: ReactNode;
		helperText?: ReactNode;
		errorText?: ReactNode;
		optionalText?: ReactNode;

		// React triggers re-render on react-hook-form changes, which drops DOM elements that depend on Chakra state
		// hence we need to postpone the change if the Field eg within a Chakra's Popover
		isSaveOnEnterOrClick?: boolean;
	} & Omit<ChakraField.RootProps, "label">,
) {
	const state = props.form.formState;
	const { formRegister, ...propsRoot } = props;

	const [value, setValue] = useState<string>(
		state.dirtyFields[formRegister.name],
	);

	return (
		<ChakraField.Root {...propsRoot}>
			{props.label && (
				<ChakraField.Label>
					{props.label}
					<ChakraField.RequiredIndicator fallback={props.optionalText} />
				</ChakraField.Label>
			)}

			<Group attached>
				<Input
					{...formRegister}
					onChange={async event => {
						if (props.isSaveOnEnterOrClick) {
							setValue(event.target.value);
						} else {
							await formRegister.onChange(event);
						}
					}}
					onKeyDown={async event => {
						if (event.key === "Enter") {
							await formRegister.onChange(event);
						}
					}}
					placeholder={props.placeholder}
					_invalid={state.errors?.[formRegister.name]}
				/>

				{props.isSaveOnEnterOrClick && (
					<IconButton
						p={0}
						variant="subtle"
						color="gray"
						type="button"
						onClick={async () => {
							await formRegister.onChange({
								target: { value: value },
							});
						}}
					>
						<CheckIcon size={10} />
					</IconButton>
				)}
			</Group>

			{props.helperText && (
				<ChakraField.HelperText>{props.helperText}</ChakraField.HelperText>
			)}
			{state.errors?.[formRegister.name]?.message && (
				<ChakraField.ErrorText>
					{state.errors?.[formRegister.name]?.message}
				</ChakraField.ErrorText>
			)}
		</ChakraField.Root>
	);
}
